# Crop rule inventory and provenance

This inventory describes the current `Crop` schema and seed records. The values in
`scripts/seedCrops.js` are retained as **project-configured legacy values**. No
institutional publication, local extension recommendation, unit, or measurement
basis is recorded alongside those values. They are not represented as
source-supported agronomic rules.

| Field | Existing records | Current treatment | Provenance |
| --- | --- | --- | --- |
| pH minimum/maximum | Present for 8 seed crops | Used only as a relative comparison against confirmed pH | Project-configured; reference not recorded |
| Suitable soil types | Present for 8 seed crops | Used only as a relative comparison against confirmed soil type | Project-configured; reference not recorded |
| N, P, K ranges | Present for 8 seed crops | Not compared to soil tests; units and range meaning are undocumented | Project-configured; unit/basis/reference unavailable |
| Water requirement | Low/Medium/High in seed records | Shown as catalog context, not an irrigation prescription | Project-configured; reference not recorded |
| Growing period | Present in seed records | Shown as catalog context only | Project-configured; reference not recorded |
| EC and organic-carbon suitability | Absent | Not evaluated | Unavailable/configuration required |
| Rainfall requirement and numeric water demand | Absent | Not evaluated | Unavailable/configuration required |
| Season and crop-stage definitions | Absent from Crop records | Not evaluated; existing calendar is separate static content | Unavailable/configuration required |
| Scientific names | Absent | Left null | Unavailable/configuration required |
| Crop nutrient targets suitable for fertilizer-gap calculations | Absent as documented, unit-aligned agronomic targets | No nutrient gap or fertilizer quantity is calculated | Unavailable/configuration required |

The recommendation score is a software ranking aid over the configured pH and
soil-type checks that can actually be evaluated. It does not predict yield or
guarantee crop performance. Add a rule as source-supported only after attaching
the exact publication/reference, applicable location/season, unit, and definition
of the measured quantity. Existing static calendar fertilizer amounts also have
no source metadata and should be reviewed before being presented as authoritative.
