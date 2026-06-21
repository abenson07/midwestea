/**
 * Read-only schema extraction from Supabase PostgREST OpenAPI (source project).
 */

export interface ColumnDef {
  name: string;
  sqlType: string;
  notNull: boolean;
  defaultSql: string | null;
  isPrimaryKey: boolean;
  foreignKey: { table: string; column: string } | null;
}

export interface TableDef {
  name: string;
  columns: ColumnDef[];
}

export interface EnumDef {
  name: string;
  values: string[];
}

export interface OpenApiSchema {
  enums: EnumDef[];
  tables: Map<string, TableDef>;
}

type OpenApiProperty = {
  type?: string;
  format?: string;
  default?: unknown;
  enum?: string[];
  description?: string;
};

type OpenApiDefinition = {
  required?: string[];
  properties?: Record<string, OpenApiProperty>;
};

function parseForeignKey(
  description?: string
): { table: string; column: string } | null {
  if (!description) return null;
  const match = description.match(/fk table='([^']+)' column='([^']+)'/i);
  if (!match) return null;
  return { table: match[1]!, column: match[2]! };
}

function mapSqlType(prop: OpenApiProperty): string {
  const format = prop.format ?? prop.type ?? 'text';

  if (format.startsWith('public.')) {
    return format.replace('public.', '');
  }

  switch (format) {
    case 'uuid':
      return 'UUID';
    case 'text':
      return 'TEXT';
    case 'integer':
      return 'INTEGER';
    case 'bigint':
      return 'BIGINT';
    case 'boolean':
      return 'BOOLEAN';
    case 'numeric':
      return 'NUMERIC';
    case 'jsonb':
      return 'JSONB';
    case 'date':
      return 'DATE';
    case 'timestamp with time zone':
      return 'TIMESTAMPTZ';
    default:
      return 'TEXT';
  }
}

function mapDefaultSql(value: unknown): string | null {
  if (value === undefined) return null;

  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'string') {
    if (
      value.startsWith('gen_random_uuid()') ||
      value.startsWith('now()') ||
      value.startsWith('timezone(')
    ) {
      return value;
    }
    return sqlString(value);
  }

  return null;
}

function sqlString(value: string): string {
  const cleaned = value.replace(/\r/g, '').replace(/\n/g, ' ').trim();
  return `'${cleaned.replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
}

export async function fetchOpenApiSchema(
  url: string,
  serviceRoleKey: string
): Promise<OpenApiSchema> {
  const response = await fetch(`${url}/rest/v1/`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch OpenAPI schema: HTTP ${response.status}`);
  }

  const payload = (await response.json()) as {
    definitions?: Record<string, OpenApiDefinition>;
  };

  const definitions = payload.definitions ?? {};
  const enumMap = new Map<string, Set<string>>();

  for (const definition of Object.values(definitions)) {
    for (const prop of Object.values(definition.properties ?? {})) {
      const format = prop.format ?? '';
      if (!format.startsWith('public.')) continue;
      const enumName = format.replace('public.', '');
      if (!enumMap.has(enumName)) {
        enumMap.set(enumName, new Set());
      }
      for (const value of prop.enum ?? []) {
        enumMap.get(enumName)!.add(value);
      }
    }
  }

  const enums: EnumDef[] = [...enumMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, values]) => ({
      name,
      values: [...values],
    }));

  const tables = new Map<string, TableDef>();

  for (const [tableName, definition] of Object.entries(definitions)) {
    const required = new Set(definition.required ?? []);
    const columns: ColumnDef[] = [];

    for (const [columnName, prop] of Object.entries(definition.properties ?? {})) {
      columns.push({
        name: columnName,
        sqlType: mapSqlType(prop),
        notNull: required.has(columnName),
        defaultSql: mapDefaultSql(prop.default),
        isPrimaryKey: prop.description?.includes('Primary Key') ?? false,
        foreignKey: parseForeignKey(prop.description),
      });
    }

    tables.set(tableName, { name: tableName, columns });
  }

  return { enums, tables };
}

export function buildEnumSql(enums: EnumDef[]): string {
  if (enums.length === 0) return '';

  const lines = [
    '-- Custom enum types (from source schema)',
    '',
  ];

  for (const enumDef of enums) {
    const labels = enumDef.values.map((v) => sqlString(v)).join(', ');
    lines.push(
      `DO $$ BEGIN`,
      `  CREATE TYPE public.${enumDef.name} AS ENUM (${labels});`,
      `EXCEPTION WHEN duplicate_object THEN NULL;`,
      `END $$;`,
      ''
    );
  }

  return lines.join('\n');
}

function columnLine(col: ColumnDef, tableName: string): string {
  let line = `  "${col.name}" ${col.sqlType}`;

  if (col.notNull) {
    line += ' NOT NULL';
  }

  if (col.defaultSql) {
    line += ` DEFAULT ${col.defaultSql}`;
  }

  if (col.isPrimaryKey) {
    line += ' PRIMARY KEY';
  }

  if (col.foreignKey && !col.isPrimaryKey) {
    line += ` REFERENCES public.${col.foreignKey.table}("${col.foreignKey.column}")`;
  }

  if (tableName === 'students' && col.name === 'id' && col.isPrimaryKey) {
    line += ' REFERENCES auth.users(id)';
  }

  if (tableName === 'admins' && col.name === 'id' && col.isPrimaryKey) {
    line = `  "id" UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`;
    if (col.notNull) {
      // already on PK line
    }
  }

  return line;
}

export function buildCreateTableSql(table: TableDef): string {
  const lines = [
    `CREATE TABLE IF NOT EXISTS public.${table.name} (`,
    table.columns.map((col) => columnLine(col, table.name)).join(',\n'),
    ');',
    '',
  ];

  return lines.join('\n');
}
