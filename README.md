# MidwestEA

## Branch notes

### `tiered-enrollment` branch family

There are six branches with `tiered-enrollment` in the name: `683-`, `684-`, `685-`, `686-`, `687-tiered-enrollment`, and an unnumbered `tiered-enrollment`.

`685-tiered-enrollment` is the canonical, most complete branch. It was verified (Aug 15, 2026) to be a strict superset of all the others:

- **683-** and **687-tiered-enrollment** are literal git ancestors of `685-tiered-enrollment`.
- **684-** and **686-tiered-enrollment** are not literal ancestors (their work was reapplied under different commits rather than merged), but a full content diff confirmed every difference is `685-tiered-enrollment` having *more* — no unique content on either branch that `685` lacks.
- The unnumbered **tiered-enrollment** branch is the least complete of all of them — it only ever absorbed part of the invoicing work and never got the prerequisite work at all. A reverse diff against `685-tiered-enrollment` confirmed it has zero unique content.

**Decision: the other five branches (`683-`, `684-`, `686-`, `687-tiered-enrollment`, and unnumbered `tiered-enrollment`) are being kept alive for now, deliberately not deleted**, purely as a safety net in case something turns out to be missing from `685-tiered-enrollment` that wasn't caught in the above verification. Once that's confirmed with more confidence (or after `685-tiered-enrollment` has been merged to `staging`/`main`), they can be deleted.
