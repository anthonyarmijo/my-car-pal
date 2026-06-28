# Vehicle Filter — Service History

**Feature:** Add a per-vehicle filter to the Service History section on the Maintenance page so users can view historical maintenance for a single vehicle.

**Status:** Spec — not yet implemented
**Date:** 2026-05-23

---

## Current State

- `app/maintenance/page.tsx` fetches ALL maintenance for a user (no vehicle filter in query)
- Data is grouped client-side into `historyByVehicle` but displayed flat
- `ServiceHistoryList` component shows every entry with a vehicle label, no filtering
- Vehicle labels are hard to scan when multiple vehicles share similar service entries

## Desired Behavior

- Add a `<select>` dropdown above the Service History list with:
  - **All vehicles** (default)
  - One option per vehicle in the user's garage
- Selecting a vehicle filters the list to show only that vehicle's history
- Filter state is client-side (no server round-trip — data is already loaded)

## Implementation Plan

The `UpcomingMaintenanceList` component already implements this exact pattern. Follow it.

### Files to modify

1. **`components/service-history-list.tsx`**
   - Add `vehicles` prop: `Array<{ id: string; label: string }>`
   - Add `useState` for `vehicleFilter` (default `"ALL"`)
   - Add `useMemo` to filter `entries` by `vehicleFilter`
   - Add `<select>` dropdown above the list (same markup as `UpcomingMaintenanceList` lines 96-106)
   - Use the filtered array for display and "Show more/less" logic

2. **`app/maintenance/page.tsx`**
   - Already computes `vehicleOptions` with `{ id, label }` (line 59-66)
   - Pass `vehicles={vehicleOptions}` to `<ServiceHistoryList>`
   - No server-side query changes needed — client filter is sufficient

### Key code pattern (from `UpcomingMaintenanceList`)

```tsx
// State
const [vehicleFilter, setVehicleFilter] = useState("ALL");

// Filter
const filtered = useMemo(() => {
  if (vehicleFilter === "ALL") return entries;
  return entries.filter((entry) => entry.vehicleId === vehicleFilter);
}, [entries, vehicleFilter]);

// Dropdown
<select value={vehicleFilter} onChange={(e) => setVehicleFilter(e.target.value)}>
  <option value="ALL">All vehicles</option>
  {vehicles.map((v) => (
    <option key={v.id} value={v.id}>{v.label}</option>
  ))}
</select>
```

### Notes

- `ServiceHistoryEntry` currently does not include `vehicleId` — add it to the type and pass it from `page.tsx`
- The `historyByVehicle` grouping in `page.tsx` (lines 71-85) is only used by `computeImportedScheduleForVehicle` — no changes needed there
- The "Show more/less" (INITIAL_VISIBLE) logic should operate on the filtered array

### Verification

1. Load `/maintenance` with 2+ vehicles in garage, each with service logs
2. Select "All vehicles" — all entries show
3. Select a specific vehicle — only that vehicle's entries show
4. "Show more/less" pagination works correctly on filtered view
5. Filter persists across navigation? No need — reset on page load is fine
