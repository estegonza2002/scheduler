import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Trash2, Image, Palette } from "lucide-react";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { FormSection } from "@/components/ui/form-section";
import { useAuth } from "@/lib/auth";
import { ContentContainer } from "@/components/ui/content-container";
import { AppContent } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useHeader } from "@/lib/header-context";

// Define branding schema
const brandingSchema = z.object({
	primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
		message: "Please enter a valid hex color code",
	}),
	secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
		message: "Please enter a valid hex color code",
	}),
	accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
		message: "Please enter a valid hex color code",
	}),
	fontFamily: z.string().min(1, "Please select a font family"),
});

type BrandingFormValues = z.infer<typeof brandingSchema>;

export default function BrandingPage() {
	const { updateHeader } = useHeader();
	const navigate = useNavigate();
	const { user } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [logoFile, setLogoFile] = useState<File | null>(null);
	const [logoPreview, setLogoPreview] = useState<string | null>(null);
	const [faviconFile, setFaviconFile] = useState<File | null>(null);
	const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

	// Set page header
	useEffect(() => {
		updateHeader({
			title: "Brand Settings",
			description: "Customize your brand appearance and assets",
		});
	}, [updateHeader]);

	const brandingForm = useForm<BrandingFormValues>({
		resolver: zodResolver(brandingSchema),
		defaultValues: {
			primaryColor: "#2563eb",
			secondaryColor: "#1e40af",
			accentColor: "#ef4444",
			fontFamily: "Inter",
		},
	});

	const handleTabChange = (tab: string) => {
		if (tab !== "branding") {
			navigate(tab === "subscription" ? "/billing" : `/profile?tab=${tab}`);
		}
	};

	const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			setLogoFile(file);
			const reader = new FileReader();
			reader.onload = () => {
				setLogoPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			setFaviconFile(file);
			const reader = new FileReader();
			reader.onload = () => {
				setFaviconPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleRemoveLogo = () => {
		setLogoFile(null);
		setLogoPreview(null);
	};

	const handleRemoveFavicon = () => {
		setFaviconFile(null);
		setFaviconPreview(null);
	};

	async function onBrandingSubmit(values: BrandingFormValues) {
		setIsLoading(true);
		try {
			// In a real implementation, this would update the branding in the database
			// and upload the logo and favicon files to a storage service
			console.log("Branding update values:", values);
			console.log("Logo file:", logoFile);
			console.log("Favicon file:", faviconFile);
			toast.success("Branding updated successfully");
		} catch (error: any) {
			toast.error("Failed to update branding: " + error.message);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<AppContent>
			<Form {...brandingForm}>
				<form
					onSubmit={brandingForm.handleSubmit(onBrandingSubmit)}
					className="space-y-6">
					<FormSection
						title="Logo & Favicon"
						description="Upload your organization's logo and assets">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							<div>
								<Label htmlFor="logo-upload">Company Logo</Label>
								<div className="mt-2 flex flex-col gap-4">
									<Card className="border-2 border-dashed border-muted-foreground/25 bg-muted/10">
										<CardContent className="flex items-center justify-center h-40 p-4">
											{logoPreview ? (
												<div className="relative w-full h-full flex items-center justify-center">
													<img
														src={logoPreview}
														alt="Logo preview"
														className="max-h-32 max-w-full object-contain"
													/>
													<Button
														type="button"
														variant="destructive"
														size="icon"
														className="absolute -top-2 -right-2 h-8 w-8"
														onClick={handleRemoveLogo}>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											) : (
												<div className="text-center">
													<Image className="mx-auto h-12 w-12 text-muted-foreground" />
													<p className="mt-2 text-sm text-muted-foreground">
														Upload your company logo (PNG, JPG, SVG)
													</p>
													<div className="mt-4">
														<label
															htmlFor="logo-upload"
															className="cursor-pointer inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent">
															<Upload className="mr-2 h-4 w-4" />
															Choose File
															<input
																id="logo-upload"
																name="logo"
																type="file"
																className="sr-only"
																accept="image/*"
																onChange={handleLogoChange}
															/>
														</label>
													</div>
												</div>
											)}
										</CardContent>
									</Card>
									<p className="text-xs text-muted-foreground">
										Recommended size: 512x512px. Max file size: 2MB.
									</p>
								</div>
							</div>

							<div>
								<Label htmlFor="favicon-upload">Favicon</Label>
								<div className="mt-2 flex flex-col gap-4">
									<Card className="border-2 border-dashed border-muted-foreground/25 bg-muted/10">
										<CardContent className="flex items-center justify-center h-40 p-4">
											{faviconPreview ? (
												<div className="relative w-full h-full flex items-center justify-center">
													<img
														src={faviconPreview}
														alt="Favicon preview"
														className="max-h-16 max-w-full object-contain"
													/>
													<Button
														type="button"
														variant="destructive"
														size="icon"
														className="absolute -top-2 -right-2 h-8 w-8"
														onClick={handleRemoveFavicon}>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											) : (
												<div className="text-center">
													<Image className="mx-auto h-12 w-12 text-muted-foreground" />
													<p className="mt-2 text-sm text-muted-foreground">
														Upload your favicon (ICO, PNG)
													</p>
													<div className="mt-4">
														<label
															htmlFor="favicon-upload"
															className="cursor-pointer inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent">
															<Upload className="mr-2 h-4 w-4" />
															Choose File
															<input
																id="favicon-upload"
																name="favicon"
																type="file"
																className="sr-only"
																accept="image/x-icon,image/png"
																onChange={handleFaviconChange}
															/>
														</label>
													</div>
												</div>
											)}
										</CardContent>
									</Card>
									<p className="text-xs text-muted-foreground">
										Recommended size: 32x32px. Max file size: 1MB.
									</p>
								</div>
							</div>
						</div>
					</FormSection>

					<FormSection
						title="Brand Colors"
						description="Define your brand's color palette">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<FormField
								control={brandingForm.control}
								name="primaryColor"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Primary Color</FormLabel>
										<div className="flex gap-2 items-center">
											<Card
												className="w-10 h-10"
												style={{ backgroundColor: field.value }}
											/>
											<FormControl>
												<Input
													{...field}
													placeholder="#2563eb"
												/>
											</FormControl>
										</div>
										<FormDescription>
											Main color used for primary UI elements
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={brandingForm.control}
								name="secondaryColor"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Secondary Color</FormLabel>
										<div className="flex gap-2 items-center">
											<Card
												className="w-10 h-10"
												style={{ backgroundColor: field.value }}
											/>
											<FormControl>
												<Input
													{...field}
													placeholder="#1e40af"
												/>
											</FormControl>
										</div>
										<FormDescription>
											Used for secondary UI elements
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={brandingForm.control}
								name="accentColor"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Accent Color</FormLabel>
										<div className="flex gap-2 items-center">
											<Card
												className="w-10 h-10"
												style={{ backgroundColor: field.value }}
											/>
											<FormControl>
												<Input
													{...field}
													placeholder="#ef4444"
												/>
											</FormControl>
										</div>
										<FormDescription>
											Used for highlighting important elements
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</FormSection>

					<FormSection
						title="Typography"
						description="Choose fonts for your application">
						<FormField
							control={brandingForm.control}
							name="fontFamily"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Font Family</FormLabel>
									<FormControl>
										<select
											{...field}
											className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
											<option value="Inter">Inter</option>
											<option value="Roboto">Roboto</option>
											<option value="Open Sans">Open Sans</option>
											<option value="Lato">Lato</option>
											<option value="Montserrat">Montserrat</option>
											<option value="Source Sans Pro">Source Sans Pro</option>
										</select>
									</FormControl>
									<FormDescription>
										The main font used throughout your application
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					</FormSection>

					<div className="flex justify-end">
						<Button
							type="submit"
							disabled={isLoading}>
							{isLoading ? "Saving..." : "Save Brand Settings"}
						</Button>
					</div>
				</form>
			</Form>
		</AppContent>
	);
}
