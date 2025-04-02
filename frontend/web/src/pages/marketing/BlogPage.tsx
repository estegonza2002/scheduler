import { Helmet } from "react-helmet";
import { AppContent } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
	Search,
	Calendar,
	Clock,
	User,
	ArrowRight,
	Tag,
	ChevronRight,
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
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Type definitions
interface BlogPost {
	id: string;
	title: string;
	excerpt: string;
	content: string;
	image: string;
	author: {
		name: string;
		avatar: string;
		title: string;
	};
	date: string;
	readTime: string;
	category: string;
	tags: string[];
	featured?: boolean;
}

export default function BlogPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [activeCategory, setActiveCategory] = useState("all");

	// Blog categories
	const categories = [
		{ id: "all", name: "All Posts" },
		{ id: "scheduling", name: "Scheduling" },
		{ id: "workforce", name: "Workforce Management" },
		{ id: "productivity", name: "Productivity" },
		{ id: "industry", name: "Industry Insights" },
		{ id: "product", name: "Product Updates" },
	];

	// Mock blog posts data
	const blogPosts: BlogPost[] = [
		{
			id: "1",
			title: "How to Optimize Your Employee Scheduling for Maximum Efficiency",
			excerpt:
				"Learn the best practices for creating schedules that maximize productivity while keeping your team happy and engaged.",
			content: "",
			image:
				"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
			author: {
				name: "Sarah Johnson",
				avatar:
					"https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
				title: "Workforce Management Specialist",
			},
			date: "June 15, 2023",
			readTime: "8 min read",
			category: "scheduling",
			tags: ["scheduling", "efficiency", "workforce management"],
			featured: true,
		},
		{
			id: "2",
			title: "5 Ways to Reduce No-Shows with Automated Notifications",
			excerpt:
				"Discover how automated notifications can significantly reduce employee no-shows and improve reliability.",
			content: "",
			image:
				"https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
			author: {
				name: "Michael Chen",
				avatar:
					"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
				title: "Product Manager",
			},
			date: "July 3, 2023",
			readTime: "6 min read",
			category: "productivity",
			tags: ["notifications", "automation", "reliability"],
		},
		{
			id: "3",
			title: "The Future of Workforce Management: AI and Predictive Scheduling",
			excerpt:
				"Explore how artificial intelligence is revolutionizing workforce management through predictive scheduling technologies.",
			content: "",
			image:
				"https://images.unsplash.com/photo-1555099962-4199c345e5dd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
			author: {
				name: "David Rodriguez",
				avatar:
					"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
				title: "AI Research Lead",
			},
			date: "August 22, 2023",
			readTime: "10 min read",
			category: "industry",
			tags: ["AI", "predictive scheduling", "future of work"],
			featured: true,
		},
		{
			id: "4",
			title:
				"How Scheduler's New Team Communication Features Streamline Operations",
			excerpt:
				"Learn about our latest release of team communication tools and how they can transform your workplace coordination.",
			content: "",
			image:
				"https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
			author: {
				name: "Emily Taylor",
				avatar:
					"https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
				title: "Product Marketing Manager",
			},
			date: "September 10, 2023",
			readTime: "7 min read",
			category: "product",
			tags: ["product update", "communication", "team coordination"],
		},
		{
			id: "5",
			title:
				"Balancing Flexibility and Coverage: The Manager's Scheduling Dilemma",
			excerpt:
				"Strategies for creating schedules that provide employees with flexibility while ensuring operational coverage.",
			content: "",
			image:
				"https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
			author: {
				name: "James Wilson",
				avatar:
					"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
				title: "Operations Director",
			},
			date: "October 5, 2023",
			readTime: "9 min read",
			category: "workforce",
			tags: ["flexibility", "coverage", "scheduling strategy"],
		},
		{
			id: "6",
			title: "Case Study: How Restaurant Chain XYZ Reduced Labor Costs by 15%",
			excerpt:
				"A detailed look at how a major restaurant chain optimized their scheduling to achieve significant labor cost savings.",
			content: "",
			image:
				"https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
			author: {
				name: "Lauren Brown",
				avatar:
					"https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
				title: "Customer Success Manager",
			},
			date: "November 12, 2023",
			readTime: "12 min read",
			category: "industry",
			tags: ["case study", "labor costs", "restaurant industry"],
		},
	];

	// Filter posts by search query and category
	const filterPosts = (
		posts: BlogPost[],
		query: string,
		category: string
	): BlogPost[] => {
		let filtered = posts;

		// Filter by category
		if (category !== "all") {
			filtered = filtered.filter((post) => post.category === category);
		}

		// Filter by search query
		if (query) {
			filtered = filtered.filter(
				(post) =>
					post.title.toLowerCase().includes(query.toLowerCase()) ||
					post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
					post.tags.some((tag) =>
						tag.toLowerCase().includes(query.toLowerCase())
					) ||
					post.category.toLowerCase().includes(query.toLowerCase())
			);
		}

		return filtered;
	};

	const filteredPosts = filterPosts(blogPosts, searchQuery, activeCategory);
	const featuredPosts = blogPosts.filter((post) => post.featured);

	return (
		<>
			<Helmet>
				<title>Blog | Scheduler</title>
			</Helmet>
			<AppContent>
				<div className="max-w-[1200px] mx-auto px-4 py-8">
					{/* Hero Section */}
					<div className="text-center mb-12">
						<h1 className="text-4xl font-bold mb-4">Scheduler Blog</h1>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Insights, tips, and best practices for efficient workforce
							scheduling and management
						</p>
					</div>

					{/* Search */}
					<div className="relative max-w-xl mx-auto mb-10">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
							<Input
								type="text"
								placeholder="Search articles..."
								className="pl-10 pr-4 py-2"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
					</div>

					{/* Featured Posts */}
					{!searchQuery &&
						activeCategory === "all" &&
						featuredPosts.length > 0 && (
							<div className="mb-12">
								<h2 className="text-2xl font-bold mb-6">Featured Articles</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{featuredPosts.map((post) => (
										<Card
											key={post.id}
											className="overflow-hidden flex flex-col h-full">
											<div className="aspect-[16/9] w-full overflow-hidden">
												<img
													src={post.image}
													alt={post.title}
													className="w-full h-full object-cover"
												/>
											</div>
											<CardHeader>
												<div className="flex items-center gap-2 mb-2">
													<Badge>{post.category}</Badge>
													<span className="text-sm text-gray-500">
														{post.date} • {post.readTime}
													</span>
												</div>
												<CardTitle className="text-2xl hover:text-primary transition-colors">
													<Link to={`/blog/${post.id}`}>{post.title}</Link>
												</CardTitle>
											</CardHeader>
											<CardContent className="flex-grow">
												<CardDescription className="text-gray-600">
													{post.excerpt}
												</CardDescription>
											</CardContent>
											<CardFooter className="flex items-center gap-4 pt-0">
												<div className="flex items-center gap-2">
													<img
														src={post.author.avatar}
														alt={post.author.name}
														className="w-8 h-8 rounded-full object-cover"
													/>
													<span className="text-sm font-medium">
														{post.author.name}
													</span>
												</div>
												<Button
													variant="link"
													asChild
													className="ml-auto p-0">
													<Link
														to={`/blog/${post.id}`}
														className="flex items-center gap-1">
														Read More <ArrowRight className="h-4 w-4" />
													</Link>
												</Button>
											</CardFooter>
										</Card>
									))}
								</div>
							</div>
						)}

					{/* Categories */}
					<div className="mb-8">
						<div className="flex overflow-x-auto pb-2 gap-2">
							{categories.map((category) => (
								<Button
									key={category.id}
									variant={
										activeCategory === category.id ? "default" : "outline"
									}
									size="sm"
									onClick={() => setActiveCategory(category.id)}
									className="whitespace-nowrap">
									{category.name}
								</Button>
							))}
						</div>
					</div>

					{/* Blog Posts */}
					{filteredPosts.length === 0 ? (
						<div className="text-center py-12">
							<h3 className="text-xl font-semibold mb-2">No articles found</h3>
							<p className="text-gray-500">
								Try adjusting your search or category filters to find what
								you're looking for.
							</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
							{filteredPosts.map((post) => (
								<Card
									key={post.id}
									className="overflow-hidden flex flex-col h-full">
									<div className="aspect-[16/9] w-full overflow-hidden">
										<img
											src={post.image}
											alt={post.title}
											className="w-full h-full object-cover"
										/>
									</div>
									<CardHeader className="pb-2">
										<div className="flex items-center gap-2 mb-2">
											<Badge>{post.category}</Badge>
										</div>
										<CardTitle className="text-xl hover:text-primary transition-colors">
											<Link to={`/blog/${post.id}`}>{post.title}</Link>
										</CardTitle>
									</CardHeader>
									<CardContent className="flex-grow py-2">
										<CardDescription className="text-gray-600 mb-4">
											{post.excerpt}
										</CardDescription>
										<div className="flex items-center gap-2 text-sm text-gray-500">
											<Calendar className="h-4 w-4" />
											<span>{post.date}</span>
											<span className="mx-1">•</span>
											<Clock className="h-4 w-4" />
											<span>{post.readTime}</span>
										</div>
									</CardContent>
									<CardFooter className="flex items-center pt-2">
										<div className="flex items-center gap-2">
											<img
												src={post.author.avatar}
												alt={post.author.name}
												className="w-6 h-6 rounded-full object-cover"
											/>
											<span className="text-sm">{post.author.name}</span>
										</div>
										<Button
											variant="link"
											asChild
											className="ml-auto p-0">
											<Link
												to={`/blog/${post.id}`}
												className="flex items-center gap-1">
												Read <ArrowRight className="h-4 w-4" />
											</Link>
										</Button>
									</CardFooter>
								</Card>
							))}
						</div>
					)}

					{/* Pagination */}
					{filteredPosts.length > 0 && (
						<Pagination className="my-8">
							<PaginationContent>
								<PaginationItem>
									<PaginationPrevious href="#" />
								</PaginationItem>
								<PaginationItem>
									<PaginationLink
										href="#"
										isActive>
										1
									</PaginationLink>
								</PaginationItem>
								<PaginationItem>
									<PaginationLink href="#">2</PaginationLink>
								</PaginationItem>
								<PaginationItem>
									<PaginationLink href="#">3</PaginationLink>
								</PaginationItem>
								<PaginationItem>
									<PaginationNext href="#" />
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					)}

					{/* Popular Tags */}
					<div className="mt-8 bg-gray-50 rounded-lg p-6">
						<h3 className="text-xl font-bold mb-4">Popular Topics</h3>
						<div className="flex flex-wrap gap-2">
							{[
								"scheduling",
								"workforce management",
								"productivity",
								"automation",
								"team communication",
								"labor costs",
								"employee engagement",
								"time tracking",
								"compliance",
							].map((tag) => (
								<Badge
									key={tag}
									variant="outline"
									className="px-3 py-1 hover:bg-gray-100 cursor-pointer">
									{tag}
								</Badge>
							))}
						</div>
					</div>

					{/* Newsletter Signup */}
					<div className="mt-12 bg-gray-50 rounded-lg p-8 text-center">
						<h2 className="text-2xl font-bold mb-3">
							Subscribe to Our Newsletter
						</h2>
						<p className="text-gray-600 mb-6 max-w-2xl mx-auto">
							Stay up-to-date with the latest scheduling tips, industry
							insights, and product updates.
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
