export default function StudentsPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Students</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage student records</p>
                </div>
            </div>

            <div className="border border-dashed border-gray-300 rounded-lg p-12 text-center">
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No students</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding a new student.</p>
            </div>
        </div>
    );
}
