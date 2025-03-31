import { Helmet } from "react-helmet";
import { AppContent } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
	Download,
	FileText,
	Play,
	Calendar,
	Clock,
	ArrowRight,
	Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

// Type definitions
interface GuideResource {
	title: string;
	description: string;
	category: string;
	image: string;
	downloadRequired: boolean;
	date: string;
	readTime: string;
}

interface WebinarResource {
	title: string;
	description: string;
	category: string;
	image: string;
	date: string;
	duration: string;
	host: string;
}

interface TutorialResource {
	title: string;
	description: string;
	category: string;
	image: string;
	duration: string;
}

type ResourceType = GuideResource | WebinarResource | TutorialResource;

export default function ResourcesPage() {
	const [searchQuery, setSearchQuery] = useState("");

	// Resources data
	const resourcesData = {
		guides: [
			{
				title: "The Complete Guide to Staff Scheduling",
				description:
					"Learn the fundamentals of effective scheduling and best practices for businesses of all sizes.",
				category: "Guide",
				image:
					"https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
				downloadRequired: true,
				date: "May 15, 2023",
				readTime: "15 min read",
			},
			{
				title: "Optimizing Labor Costs Without Sacrificing Quality",
				description:
					"Discover strategies to balance cost efficiency with service excellence in your scheduling approach.",
				category: "Whitepaper",
				image:
					"https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
				downloadRequired: true,
				date: "June 3, 2023",
				readTime: "12 min read",
			},
			{
				title: "Compliance Guide: Labor Laws and Scheduling",
				description:
					"Stay compliant with scheduling regulations and labor laws across different regions.",
				category: "Guide",
				image:
					"https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
				downloadRequired: true,
				date: "July 22, 2023",
				readTime: "20 min read",
			},
			{
				title: "2023 Employee Scheduling Trends Report",
				description:
					"Explore the latest trends, technologies, and strategies shaping the future of workforce scheduling.",
				category: "Report",
				image:
					"https://images.unsplash.com/photo-1590402494610-2c378a9114c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
				downloadRequired: true,
				date: "August 10, 2023",
				readTime: "18 min read",
			},
		] as GuideResource[],
		webinars: [
			{
				title: "Advanced Scheduling Techniques for Multi-Location Businesses",
				description:
					"Learn strategies for coordinating schedules across multiple locations while maintaining consistency.",
				category: "Webinar",
				image:
					"https://images.unsplash.com/photo-1591115765373-5207764f72e4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
				date: "September 5, 2023",
				duration: "45 minutes",
				host: "Sarah Johnson, Director of Operations",
			},
			{
				title: "Mastering Employee Availability and Time-Off Management",
				description:
					"Discover how to effectively manage employee availability and time-off requests.",
				category: "Webinar",
				image:
					"https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
				date: "October 12, 2023",
				duration: "60 minutes",
				host: "Michael Chen, HR Director",
			},
			{
				title: "Using Analytics to Improve Scheduling Efficiency",
				description:
					"Learn how to leverage scheduling data to optimize your workforce planning.",
				category: "Webinar",
				image:
					"https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
				date: "November 8, 2023",
				duration: "50 minutes",
				host: "David Rodriguez, Data Analyst",
			},
			{
				title: "Scheduling for Healthcare: Best Practices and Compliance",
				description:
					"Specialized scheduling approaches for healthcare organizations with complex requirements.",
				category: "Webinar",
				image:
					"https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
				date: "December 3, 2023",
				duration: "55 minutes",
				host: "Dr. Emily Taylor, Healthcare Consultant",
			},
		] as WebinarResource[],
		tutorials: [
			{
				title: "Getting Started with Scheduler",
				description:
					"A step-by-step guide to setting up your account and creating your first schedule.",
				category: "Tutorial",
				image:
					"https://images.unsplash.com/photo-1611926653458-09294b3142bf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
				duration: "10 minutes",
			},
			{
				title: "Advanced Schedule Templates",
				description:
					"Learn how to create and manage schedule templates for repeating patterns.",
				category: "Tutorial",
				image:
					"https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
				duration: "15 minutes",
			},
			{
				title: "Setting Up Automated Scheduling Rules",
				description:
					"Configure rules for automated scheduling based on skills, availability, and business needs.",
				category: "Tutorial",
				image:
					"https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
				duration: "12 minutes",
			},
			{
				title: "Mobile App Features and Walkthrough",
				description:
					"Explore all the features available in the Scheduler mobile app for managers and employees.",
				category: "Tutorial",
				image:
					"https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
				duration: "8 minutes",
			},
		] as TutorialResource[],
	};

	// Filter resources based on search query
	const filterResources = <T extends ResourceType>(
		resources: T[],
		query: string
	): T[] => {
		if (!query) return resources;

		return resources.filter(
			(resource) =>
				resource.title.toLowerCase().includes(query.toLowerCase()) ||
				resource.description.toLowerCase().includes(query.toLowerCase()) ||
				resource.category.toLowerCase().includes(query.toLowerCase())
		);
	};

	const filteredGuides = filterResources<GuideResource>(
		resourcesData.guides,
		searchQuery
	);
	const filteredWebinars = filterResources<WebinarResource>(
		resourcesData.webinars,
		searchQuery
	);
	const filteredTutorials = filterResources<TutorialResource>(
		resourcesData.tutorials,
		searchQuery
	);

	// Lead capture modal (simplified)
	const handleDownload = (title: string): void => {
		alert(
			`To download "${title}", please enter your email in the form that would appear here.`
		);
	};

	return (
		<>
			<Helmet>
				<title>Resources | Scheduler</title>
			</Helmet>
			<AppContent>
				<div className="max-w-[1400px] mx-auto px-4 py-8">
					{/* Hero Section */}
					<div className="text-center mb-12">
						<h1 className="text-4xl font-bold mb-4">
							Resources to Help You Master Scheduling
						</h1>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Explore our library of guides, tutorials, and webinars to help you
							get the most out of Scheduler and optimize your workforce
							management.
						</p>
					</div>

					{/* Search */}
					<div className="relative max-w-xl mx-auto mb-10">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
							<Input
								type="text"
								placeholder="Search resources..."
								className="pl-10 pr-4 py-2"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
					</div>

					{/* Resources Tabs */}
					<Tabs
						defaultValue="guides"
						className="w-full">
						<TabsList className="w-full max-w-md mx-auto mb-8 grid grid-cols-3">
							<TabsTrigger value="guides">Guides & Whitepapers</TabsTrigger>
							<TabsTrigger value="webinars">Webinars</TabsTrigger>
							<TabsTrigger value="tutorials">Tutorials</TabsTrigger>
						</TabsList>

						{/* Guides & Whitepapers */}
						<TabsContent value="guides">
							{filteredGuides.length === 0 ? (
								<div className="text-center py-8">
									<p className="text-gray-500">
										No guides or whitepapers found matching your search.
									</p>
								</div>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
									{filteredGuides.map((guide, i) => (
										<Card
											key={i}
											className="overflow-hidden flex flex-col h-full">
											<div className="aspect-video w-full overflow-hidden">
												<img
													src={guide.image}
													alt={guide.title}
													className="w-full h-full object-cover"
												/>
											</div>
											<CardHeader className="pb-2">
												<div className="flex justify-between items-start">
													<Badge className="mb-2">{guide.category}</Badge>
													<div className="text-sm text-gray-500">
														{guide.date}
													</div>
												</div>
												<CardTitle className="text-xl">{guide.title}</CardTitle>
											</CardHeader>
											<CardContent className="py-2 flex-grow">
												<CardDescription className="text-gray-600">
													{guide.description}
												</CardDescription>
											</CardContent>
											<CardFooter className="flex items-center justify-between pt-2">
												<div className="flex items-center text-sm text-gray-500">
													<Clock className="h-4 w-4 mr-1" />
													{guide.readTime}
												</div>
												<Button
													variant="secondary"
													size="sm"
													onClick={() => handleDownload(guide.title)}
													className="flex items-center">
													<Download className="h-4 w-4 mr-1" />
													Download
												</Button>
											</CardFooter>
										</Card>
									))}
								</div>
							)}
						</TabsContent>

						{/* Webinars */}
						<TabsContent value="webinars">
							{filteredWebinars.length === 0 ? (
								<div className="text-center py-8">
									<p className="text-gray-500">
										No webinars found matching your search.
									</p>
								</div>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
									{filteredWebinars.map((webinar, i) => (
										<Card
											key={i}
											className="overflow-hidden flex flex-col h-full">
											<div className="aspect-video w-full overflow-hidden relative">
												<img
													src={webinar.image}
													alt={webinar.title}
													className="w-full h-full object-cover"
												/>
												<div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
													<div className="rounded-full bg-white bg-opacity-80 p-3">
														<Play className="h-8 w-8 text-primary" />
													</div>
												</div>
											</div>
											<CardHeader className="pb-2">
												<div className="flex justify-between items-start">
													<Badge className="mb-2">{webinar.category}</Badge>
													<div className="text-sm text-gray-500 whitespace-nowrap ml-2">
														{webinar.date}
													</div>
												</div>
												<CardTitle className="text-xl">
													{webinar.title}
												</CardTitle>
												<div className="text-sm text-gray-500">
													Hosted by {webinar.host}
												</div>
											</CardHeader>
											<CardContent className="py-2 flex-grow">
												<CardDescription className="text-gray-600">
													{webinar.description}
												</CardDescription>
											</CardContent>
											<CardFooter className="flex items-center justify-between pt-2">
												<div className="flex items-center text-sm text-gray-500">
													<Clock className="h-4 w-4 mr-1" />
													{webinar.duration}
												</div>
												<Button
													variant="secondary"
													size="sm"
													className="flex items-center">
													<Calendar className="h-4 w-4 mr-1" />
													Register
												</Button>
											</CardFooter>
										</Card>
									))}
								</div>
							)}
						</TabsContent>

						{/* Tutorials */}
						<TabsContent value="tutorials">
							{filteredTutorials.length === 0 ? (
								<div className="text-center py-8">
									<p className="text-gray-500">
										No tutorials found matching your search.
									</p>
								</div>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
									{filteredTutorials.map((tutorial, i) => (
										<Card
											key={i}
											className="overflow-hidden flex flex-col h-full">
											<div className="aspect-video w-full overflow-hidden relative">
												<img
													src={tutorial.image}
													alt={tutorial.title}
													className="w-full h-full object-cover"
												/>
												<div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
													<div className="rounded-full bg-white bg-opacity-80 p-3">
														<Play className="h-8 w-8 text-primary" />
													</div>
												</div>
											</div>
											<CardHeader className="pb-2">
												<div className="flex justify-between items-start">
													<Badge className="mb-2">{tutorial.category}</Badge>
												</div>
												<CardTitle className="text-xl">
													{tutorial.title}
												</CardTitle>
											</CardHeader>
											<CardContent className="py-2 flex-grow">
												<CardDescription className="text-gray-600">
													{tutorial.description}
												</CardDescription>
											</CardContent>
											<CardFooter className="flex items-center justify-between pt-2">
												<div className="flex items-center text-sm text-gray-500">
													<Clock className="h-4 w-4 mr-1" />
													{tutorial.duration}
												</div>
												<Button
													variant="secondary"
													size="sm"
													className="flex items-center">
													<Play className="h-4 w-4 mr-1" />
													Watch Now
												</Button>
											</CardFooter>
										</Card>
									))}
								</div>
							)}
						</TabsContent>
					</Tabs>

					{/* Newsletter Signup */}
					<div className="mt-20 bg-gray-50 rounded-lg p-8 text-center">
						<h2 className="text-2xl font-bold mb-3">
							Stay Updated with Our Latest Resources
						</h2>
						<p className="text-gray-600 mb-6 max-w-2xl mx-auto">
							Subscribe to our newsletter to receive monthly updates on new
							resources, webinars, and scheduling tips.
						</p>
						<div className="flex max-w-md mx-auto">
							<Input
								type="email"
								placeholder="Your email address"
								className="mr-2"
							/>
							<Button>Subscribe</Button>
						</div>
					</div>
				</div>
			</AppContent>
		</>
	);
}
