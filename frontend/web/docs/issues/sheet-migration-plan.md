# Sheet Component Migration Plan

## Overview

This document outlines the plan for migrating all components currently using the custom `StandardSheet` wrapper to directly use the standard ShadCN sheet components instead. This approach aligns with our design system principle of using shadCN components with Tailwind CSS only, avoiding custom wrappers.

## Components to Update

The following components need to be updated to use standard ShadCN components directly:

1. ✓ **LocationEditSheet** - Form sheet for editing locations
2. ✓ **LocationAssignmentSheet** - Information sheet for assigning locations
3. ✓ **ShiftCreationSheet** - Multi-step sheet for creating shifts
4. ✓ **EmployeeSheet** - Form sheet for creating/editing employees
5. ✓ **LocationCreationSheet** - Form sheet for creating locations
6. ✓ **EmployeeAssignmentSheet** - Information sheet for assigning employees

## Migration Status

All sheet components have been successfully migrated to use standard ShadCN components directly. The next steps are:

1. Delete the `StandardSheet.tsx` file
2. Update the design system documentation to emphasize the direct usage of ShadCN components
3. Remove references to `StandardSheet` from implementation progress tracking documents

## Migration Strategy

For each component, follow these steps:

1. Replace the import of `StandardSheet` with imports for individual ShadCN sheet components:

   ```tsx
   import {
   	Sheet,
   	SheetContent,
   	SheetHeader,
   	SheetTitle,
   	SheetDescription,
   	SheetFooter,
   	SheetTrigger,
   } from "@/components/ui/sheet";
   import { ScrollArea } from "@/components/ui/scroll-area";
   ```

2. Replace the `StandardSheet` JSX with the direct ShadCN components:

   ```tsx
   // From:
   <StandardSheet
     title="Example Title"
     description="Example description"
     icon={<Icon className="h-5 w-5 text-primary" />}
     trigger={trigger}
     footer={footerContent}
     open={isOpen}
     onOpenChange={handleOpenChange}
     className={className}
     size="md">
     {children}
   </StandardSheet>

   // To:
   <Sheet
     open={isOpen}
     onOpenChange={handleOpenChange}>
     <SheetTrigger asChild>
       {trigger || <Button>Default Text</Button>}
     </SheetTrigger>

     <SheetContent className={cn("sm:max-w-md", className)}>
       <SheetHeader>
         <div className="flex items-center gap-2">
           <Icon className="h-5 w-5 text-primary" />
           <SheetTitle>Example Title</SheetTitle>
         </div>
         <SheetDescription>Example description</SheetDescription>
       </SheetHeader>

       <ScrollArea className="my-4 h-[calc(100vh-12rem)]">
         <div className="px-1">
           {children}
         </div>
       </ScrollArea>

       {footer && (
         <SheetFooter>
           {footerContent}
         </SheetFooter>
       )}
     </SheetContent>
   </Sheet>
   ```

3. Convert any `size` prop usage to the appropriate Tailwind class:

   - `size="sm"` → `className="sm:max-w-sm"`
   - `size="md"` → `className="sm:max-w-md"`
   - `size="lg"` → `className="sm:max-w-lg"`
   - `size="xl"` → `className="sm:max-w-xl"`
   - `size="full"` → `className="sm:max-w-full"`

4. Implement appropriate footer content in `SheetFooter` directly

5. Ensure content is wrapped in a `ScrollArea` for proper scrolling behavior

## Testing

After each component is updated:

1. Test all functionality to ensure it works as expected
2. Verify the visual appearance and behavior match the original implementation
3. Test responsive design to ensure it adapts correctly across screen sizes
4. Check that all props continue to work (open state, callbacks, etc.)

## Post-Migration

Once all components have been migrated:

1. Delete the `StandardSheet.tsx` file
2. Update the design system documentation to emphasize the direct usage of ShadCN components
3. Update any example code to use the standard components directly
4. Remove references to `StandardSheet` from implementation progress tracking documents
