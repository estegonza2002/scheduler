import React from "react";
import { Controller, UseControllerProps, FieldValues } from "react-hook-form";
import { PhoneInput } from "./phone-input";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./form";

interface FormPhoneInputProps<T extends FieldValues>
	extends UseControllerProps<T> {
	label?: string;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
	countryField?: string; // Field name containing the country in the form
}

export function FormPhoneInput<T extends FieldValues>({
	control,
	name,
	label,
	placeholder,
	className,
	disabled,
	countryField,
	...props
}: FormPhoneInputProps<T>) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field, fieldState }) => (
				<FormItem className={className}>
					{label && <FormLabel>{label}</FormLabel>}
					<FormControl>
						<PhoneInput
							value={field.value}
							onChange={field.onChange}
							placeholder={placeholder}
							disabled={disabled}
							error={fieldState.error?.message}
							id={`${name}-input`}
							name={name}
							countryField={countryField}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
			{...props}
		/>
	);
}
