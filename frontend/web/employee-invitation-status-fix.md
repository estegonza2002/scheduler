# Implementation Plan for Employee Invitation Status Fix

## Problem Summary

Currently, new test employees are incorrectly created with "active" status by default instead of "invited" status, causing them to display checkmarks rather than "Pending Signup" badges in the UI.

## Implementation Plan

### Phase 1: Code Changes

1. **Update Employee Creation Form Default Status**

   - Modify `src/components/EmployeeForm.tsx` to set default status to "invited" for new employees:

   ```typescript
   status: initialData?.status || "invited", // Changed from "active"
   ```

2. **Update Direct API Creation Default Status**

   - Modify `src/pages/EmployeesPage.tsx` Add Employee dialog to set default status to "invited":

   ```typescript
   status: "invited", // Changed from "active"
   ```

3. **Update API Implementation Default Status**

   - Modify `src/api/real/api.ts` to set default status to "invited":

   ```typescript
   status: data.status || "invited", // Changed from "active"
   ```

4. **Add Status Toggle Option in UI (Optional Enhancement)**
   - Add checkbox or toggle in the employee creation form:
   ```typescript
   <FormField
   	control={form.control}
   	name="sendInvite"
   	render={({ field }) => (
   		<FormItem className="flex flex-row items-start space-x-3 space-y-0">
   			<FormControl>
   				<Checkbox
   					checked={field.value}
   					onCheckedChange={field.onChange}
   				/>
   			</FormControl>
   			<div>
   				<FormLabel>Send account invitation</FormLabel>
   				<FormDescription>
   					Employee will receive an email to set up their account
   				</FormDescription>
   			</div>
   		</FormItem>
   	)}
   />
   ```

### Phase 2: Database Updates

1. **Audit Existing Data**

   - Create a query to identify employees with incorrect statuses:

   ```sql
   SELECT id, name, email, status FROM employees WHERE status = 'active';
   ```

2. **Batch Update Incorrect Statuses**
   - Update test employees with invalid emails to "invited" status:
   ```sql
   UPDATE employees SET status = 'invited' WHERE email LIKE '%@example.com' OR email LIKE '%test%';
   ```
   - For specific employees with known test emails:
   ```sql
   UPDATE employees SET status = 'invited' WHERE id IN ('id1', 'id2', 'id3');
   ```

### Phase 3: Testing

1. **Manual Testing**

   - Create new test employees and verify they default to "invited" status
   - Check the UI to ensure they show "Pending Signup" badges
   - Verify resend invitation functionality works correctly

2. **Edge Case Testing**
   - Test with various email formats
   - Test with existing vs new emails
   - Verify UX when multiple employees are invited

### Phase 4: Documentation

1. **Update Documentation**
   - Document the employee status workflow
   - Document the invitation process
   - Update any admin guides

## Progress Tracking

| Task                                     | Status   | Owner | Target Date | Completion Date | Notes                                      |
| ---------------------------------------- | -------- | ----- | ----------- | --------------- | ------------------------------------------ |
| Update EmployeeForm.tsx default status   | ✅ Done  |       |             |                 | Changed default from "active" to "invited" |
| Update EmployeesPage.tsx default status  | ✅ Done  |       |             |                 | Changed default in dialog and fixed import |
| Update API implementation default status | ✅ Done  |       |             |                 | Changed default in API create method       |
| Add status toggle in UI (optional)       | ⬜ To Do |       |             |                 |                                            |
| Audit existing employee data             | ⬜ To Do |       |             |                 |                                            |
| Batch update incorrect statuses          | ⬜ To Do |       |             |                 |                                            |
| Manual testing of changes                | ⬜ To Do |       |             |                 |                                            |
| Edge case testing                        | ⬜ To Do |       |             |                 |                                            |
| Update documentation                     | ⬜ To Do |       |             |                 |                                            |

## Implementation Priority

1. Code changes (highest priority)
2. Database updates
3. Testing
4. Documentation (can be done in parallel)
