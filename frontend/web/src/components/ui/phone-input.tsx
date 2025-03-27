import React, { forwardRef, useEffect, useState } from "react";
import PhoneInputBase, {
	Country,
	parsePhoneNumber,
} from "react-phone-number-input";
import type { E164Number } from "libphonenumber-js";
import {
	getCountryCallingCode,
	getExampleNumber,
	AsYouType,
} from "libphonenumber-js/max";
import examples from "libphonenumber-js/examples.mobile.json";
import "react-phone-number-input/style.css";
import "./phone-input.css";
import { cn } from "@/lib/utils";
import { Label } from "./label";
import { FormMessage } from "./form";

export interface PhoneInputProps {
	value: E164Number | undefined;
	onChange: (value?: E164Number) => void;
	className?: string;
	label?: string;
	error?: string;
	defaultCountry?: Country;
	international?: boolean;
	withCountryCallingCode?: boolean;
	placeholder?: string;
	disabled?: boolean;
	name?: string;
	id?: string;
	countryField?: string; // The name of the field containing the country in the parent form
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
	(
		{
			className,
			label,
			error,
			defaultCountry = "US" as Country,
			international = true,
			withCountryCallingCode = true,
			placeholder = "Enter phone number",
			countryField,
			value,
			onChange,
			...props
		},
		ref
	) => {
		// Country code map (ISO 3166-1 alpha-2 country codes)
		// Expanded to include more variations and common country names
		const countryCodeMap: Record<string, Country> = {
			// North America
			"United States": "US",
			USA: "US",
			US: "US",
			America: "US",
			Canada: "CA",
			Mexico: "MX",

			// Europe
			"United Kingdom": "GB",
			UK: "GB",
			"Great Britain": "GB",
			England: "GB",
			France: "FR",
			Germany: "DE",
			Italy: "IT",
			Spain: "ES",
			Portugal: "PT",
			Ireland: "IE",
			Netherlands: "NL",
			Belgium: "BE",
			Switzerland: "CH",
			Austria: "AT",
			Sweden: "SE",
			Norway: "NO",
			Denmark: "DK",
			Finland: "FI",
			Greece: "GR",
			Poland: "PL",

			// Asia
			Japan: "JP",
			China: "CN",
			India: "IN",
			"South Korea": "KR",
			Korea: "KR",
			Thailand: "TH",
			Vietnam: "VN",
			Singapore: "SG",
			Malaysia: "MY",
			Indonesia: "ID",
			Philippines: "PH",

			// Oceania
			Australia: "AU",
			"New Zealand": "NZ",

			// South America
			Brazil: "BR",
			Argentina: "AR",
			Chile: "CL",
			Colombia: "CO",
			Peru: "PE",

			// Africa
			"South Africa": "ZA",
			Egypt: "EG",
			Nigeria: "NG",
			Kenya: "KE",
			Morocco: "MA",
		};

		// Try to derive the country code from the form context
		const [derivedCountry, setDerivedCountry] = useState<Country | undefined>(
			undefined
		);

		// Real-time validation state
		const [isRealTimeValid, setIsRealTimeValid] = useState<boolean>(true);
		const [customError, setCustomError] = useState<string | undefined>(
			undefined
		);

		// Find any parent form element to access form data
		useEffect(() => {
			const form = document.querySelector("form");
			if (form && countryField) {
				const countryInput = form.querySelector(
					`[name="${countryField}"]`
				) as HTMLInputElement;
				if (countryInput && countryInput.value) {
					const countryValue = countryInput.value.trim();

					// Try direct match first
					let countryCode = countryCodeMap[countryValue] as Country | undefined;

					// If no direct match, try case-insensitive matching
					if (!countryCode) {
						const normalizedCountry = countryValue.toLowerCase();
						const entry = Object.entries(countryCodeMap).find(
							([key]) => key.toLowerCase() === normalizedCountry
						);
						if (entry) {
							countryCode = entry[1] as Country;
						}
					}

					// If still no match, try partial matching (for cases like "United States of America")
					if (!countryCode) {
						const normalizedCountry = countryValue.toLowerCase();
						for (const [key, value] of Object.entries(countryCodeMap)) {
							if (
								normalizedCountry.includes(key.toLowerCase()) ||
								key.toLowerCase().includes(normalizedCountry)
							) {
								countryCode = value as Country;
								break;
							}
						}
					}

					if (countryCode) {
						setDerivedCountry(countryCode);
					}
				}
			}
		}, [countryField]);

		// Use the derived country if available, otherwise use the default
		const effectiveCountry = derivedCountry || defaultCountry;

		// Get example phone format for the current country
		const getExampleFormat = (country: Country) => {
			try {
				const example = getExampleNumber(country, examples);
				return example ? example.formatNational() : "";
			} catch (error) {
				return "";
			}
		};

		// Calculate max length for the country
		const getMaxLength = (country: Country): number => {
			try {
				// Get example number to determine max length
				const example = getExampleNumber(country, examples);
				// Add buffer for potential additional digits (typically 2-3 more than example)
				return example ? example.nationalNumber.length + 3 : 15;
			} catch (error) {
				// Default fallback if we can't determine
				return 15;
			}
		};

		// Handle custom onChange with validation
		const handleChange = (newValue?: E164Number) => {
			if (newValue) {
				try {
					// Check if value exceeds max length for the country
					const parsedNumber = parsePhoneNumber(newValue.toString());
					if (parsedNumber) {
						const maxLength = getMaxLength(parsedNumber.country as Country);
						const nationalNumber = parsedNumber.nationalNumber;

						// Check if number exceeds max length
						if (nationalNumber.length > maxLength) {
							setIsRealTimeValid(false);
							setCustomError(`Phone number too long (max ${maxLength} digits)`);
						} else {
							setIsRealTimeValid(true);
							setCustomError(undefined);
						}
					}
				} catch (e) {
					// If parsing fails, we still continue but mark as potentially invalid
					setIsRealTimeValid(false);
				}
			} else {
				setIsRealTimeValid(true);
				setCustomError(undefined);
			}

			// Pass the value to parent component's onChange
			onChange(newValue);
		};

		// Dynamic placeholder based on country format
		const dynamicPlaceholder =
			getExampleFormat(effectiveCountry) || placeholder;

		return (
			<div className="space-y-2">
				{label && <Label>{label}</Label>}
				<div
					className={cn(
						"phone-input-container",
						(error || !isRealTimeValid) && "border-red-500",
						className
					)}>
					<PhoneInputBase
						ref={ref as any}
						international={international}
						defaultCountry={effectiveCountry}
						withCountryCallingCode={withCountryCallingCode}
						placeholder={dynamicPlaceholder}
						className={cn(
							"flex h-10 w-full rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
							!isRealTimeValid && "border-red-500 focus:border-red-500"
						)}
						smartCaret={true}
						limitMaxLength={true}
						value={value}
						onChange={handleChange}
						{...props}
					/>
				</div>
				{(error || customError) && (
					<FormMessage>{customError || error}</FormMessage>
				)}
			</div>
		);
	}
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
