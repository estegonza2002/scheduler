import { Helmet } from "react-helmet";
import { AppContent } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
	Calendar,
	Clock,
	User,
	Share2,
	Twitter,
	Facebook,
	Linkedin,
	Link as LinkIcon,
	ArrowLeft,
	ArrowRight,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";

// Types
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
		bio: string;
	};
	date: string;
	readTime: string;
	category: string;
	tags: string[];
	featured?: boolean;
	relatedPosts?: string[];
}

export default function BlogPostPage() {
	const { postId } = useParams<{ postId: string }>();
	const [post, setPost] = useState<BlogPost | null>(null);
	const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

	// Mock blog posts data - in a real application, this would be fetched from an API
	const blogPosts: BlogPost[] = [
		{
			id: "1",
			title: "How to Optimize Your Employee Scheduling for Maximum Efficiency",
			excerpt:
				"Learn the best practices for creating schedules that maximize productivity while keeping your team happy and engaged.",
			content: `
        <p>Effective employee scheduling is one of the most important aspects of workforce management. When done right, it can significantly improve productivity, employee satisfaction, and your bottom line. In this comprehensive guide, we'll explore proven strategies to optimize your scheduling process.</p>
        
        <h2>Understanding Your Workforce Needs</h2>
        
        <p>Before creating any schedule, it's crucial to understand your operational requirements:</p>
        
        <ul>
          <li>Analyze historical data to identify peak hours and days</li>
          <li>Consider seasonal fluctuations in demand</li>
          <li>Evaluate employee skills and certifications to ensure proper coverage</li>
          <li>Account for legal requirements regarding breaks, overtime, and maximum hours</li>
        </ul>
        
        <p>By establishing a clear picture of your needs, you'll be better equipped to create schedules that align with business requirements while respecting employee preferences.</p>
        
        <h2>Implementing Advanced Scheduling Techniques</h2>
        
        <p>Once you understand your needs, consider these techniques to improve efficiency:</p>
        
        <h3>1. Shift Patterns and Templates</h3>
        
        <p>Create standardized shift patterns that employees can count on. This predictability helps with work-life balance and reduces scheduling conflicts. Scheduler's template feature allows you to save these patterns and apply them with a single click.</p>
        
        <h3>2. Skills-Based Scheduling</h3>
        
        <p>Ensure you have the right people with the right skills at the right time. This prevents situations where you're overstaffed in some areas and understaffed in others.</p>
        
        <h3>3. Availability Management</h3>
        
        <p>Maintain updated records of employee availability and preferences. This reduces the likelihood of scheduling conflicts and increases employee satisfaction.</p>
        
        <h2>Leveraging Technology for Better Scheduling</h2>
        
        <p>Modern scheduling tools like Scheduler offer automated solutions that can dramatically improve your efficiency:</p>
        
        <ul>
          <li>Automated scheduling based on rules and preferences</li>
          <li>Real-time updates and notifications</li>
          <li>Mobile access for managers and employees</li>
          <li>Integration with other systems like payroll and HR</li>
        </ul>
        
        <p>By implementing these strategies and leveraging the right technology, you can create schedules that work for both your business and your employees, leading to higher productivity and satisfaction across the board.</p>
      `,
			image:
				"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
			author: {
				name: "Sarah Johnson",
				avatar:
					"https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
				title: "Workforce Management Specialist",
				bio: "Sarah has over 10 years of experience in workforce management and specializes in optimization strategies for diverse industries.",
			},
			date: "June 15, 2023",
			readTime: "8 min read",
			category: "scheduling",
			tags: ["scheduling", "efficiency", "workforce management"],
			relatedPosts: ["2", "5"],
		},
		{
			id: "2",
			title: "5 Ways to Reduce No-Shows with Automated Notifications",
			excerpt:
				"Discover how automated notifications can significantly reduce employee no-shows and improve reliability.",
			content: `
        <p>Employee no-shows can be a significant disruption to your operations. They lead to understaffing, overworked remaining employees, and potential service issues. Implementing a robust notification system is one of the most effective ways to combat this problem.</p>
        
        <h2>The True Cost of No-Shows</h2>
        
        <p>Before diving into solutions, it's important to understand the full impact of no-shows:</p>
        
        <ul>
          <li>Direct labor costs from emergency coverage or overtime</li>
          <li>Decreased morale among employees who have to pick up the slack</li>
          <li>Potential customer service deterioration</li>
          <li>Administrative time spent managing last-minute changes</li>
        </ul>
        
        <p>Studies show that businesses can lose up to 30% in productivity due to unexpected absences.</p>
        
        <h2>Leveraging Automated Notifications</h2>
        
        <p>Here are five ways automated notifications can help reduce no-shows:</p>
        
        <h3>1. Shift Reminders</h3>
        
        <p>Send automatic reminders 24 hours before and again a few hours before each shift. These simple nudges can significantly reduce forgotten shifts.</p>
        
        <h3>2. Schedule Change Alerts</h3>
        
        <p>Immediately notify employees when there are changes to their schedules. This ensures everyone is aware of their most current commitments.</p>
        
        <h3>3. Acknowledgment Requirements</h3>
        
        <p>Require employees to acknowledge their upcoming shifts. This creates accountability and provides managers with visibility into potential issues.</p>
        
        <h3>4. Absence Reporting System</h3>
        
        <p>Make it easy for employees to report when they will be absent. A simple mobile-friendly system reduces the friction of proper notification.</p>
        
        <h3>5. Incentive Programs</h3>
        
        <p>Use notifications to support attendance incentive programs, congratulating employees on perfect attendance streaks or meeting reliability goals.</p>
        
        <h2>Implementation Best Practices</h2>
        
        <p>When setting up your notification system:</p>
        
        <ul>
          <li>Allow employees to select their preferred notification methods (text, email, app push notifications)</li>
          <li>Keep messages clear and concise</li>
          <li>Include essential information only (date, time, location, position)</li>
          <li>Set appropriate timing for different types of notifications</li>
        </ul>
        
        <p>By implementing these strategies, businesses have seen no-show rates decrease by up to 70%, resulting in smoother operations and significant cost savings.</p>
      `,
			image:
				"https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
			author: {
				name: "Michael Chen",
				avatar:
					"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
				title: "Product Manager",
				bio: "Michael has spent his career developing workforce management solutions that help businesses improve operational efficiency.",
			},
			date: "July 3, 2023",
			readTime: "6 min read",
			category: "productivity",
			tags: ["notifications", "automation", "reliability"],
			relatedPosts: ["1", "4"],
		},
		{
			id: "3",
			title: "The Future of Workforce Management: AI and Predictive Scheduling",
			excerpt:
				"Explore how artificial intelligence is revolutionizing workforce management through predictive scheduling technologies.",
			content: `<p>Artificial Intelligence (AI) is transforming workforce management in unprecedented ways. Predictive scheduling, powered by machine learning algorithms, is at the forefront of this revolution. This technology analyzes historical data, current trends, and external factors to generate optimal schedules that benefit both businesses and employees.</p>`,
			image:
				"https://images.unsplash.com/photo-1555099962-4199c345e5dd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
			author: {
				name: "David Rodriguez",
				avatar:
					"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
				title: "AI Research Lead",
				bio: "David leads research into AI applications for workforce management, with a focus on practical implementations that deliver measurable results.",
			},
			date: "August 22, 2023",
			readTime: "10 min read",
			category: "industry",
			tags: ["AI", "predictive scheduling", "future of work"],
			relatedPosts: ["6", "5"],
		},
		{
			id: "4",
			title:
				"How Scheduler's New Team Communication Features Streamline Operations",
			excerpt:
				"Learn about our latest release of team communication tools and how they can transform your workplace coordination.",
			content: `<p>Effective team communication is the backbone of efficient operations. Scheduler's latest update introduces powerful new communication features designed to keep your team connected and informed at all times.</p>`,
			image:
				"https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
			author: {
				name: "Emily Taylor",
				avatar:
					"https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
				title: "Product Marketing Manager",
				bio: "Emily works closely with product development teams to bring innovative solutions to market, focusing on features that solve real customer problems.",
			},
			date: "September 10, 2023",
			readTime: "7 min read",
			category: "product",
			tags: ["product update", "communication", "team coordination"],
			relatedPosts: ["2", "6"],
		},
		{
			id: "5",
			title:
				"Balancing Flexibility and Coverage: The Manager's Scheduling Dilemma",
			excerpt:
				"Strategies for creating schedules that provide employees with flexibility while ensuring operational coverage.",
			content: `<p>One of the greatest challenges for managers today is balancing the need for consistent operational coverage with employees' growing demand for flexible work arrangements. This article explores practical strategies for achieving this delicate balance.</p>`,
			image:
				"https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
			author: {
				name: "James Wilson",
				avatar:
					"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
				title: "Operations Director",
				bio: "James has managed large operational teams across multiple industries and specializes in creating work environments that meet both business and employee needs.",
			},
			date: "October 5, 2023",
			readTime: "9 min read",
			category: "workforce",
			tags: ["flexibility", "coverage", "scheduling strategy"],
			relatedPosts: ["1", "3"],
		},
		{
			id: "6",
			title: "Case Study: How Restaurant Chain XYZ Reduced Labor Costs by 15%",
			excerpt:
				"A detailed look at how a major restaurant chain optimized their scheduling to achieve significant labor cost savings.",
			content: `<p>In this case study, we examine how Restaurant Chain XYZ implemented Scheduler to optimize their workforce management, resulting in a 15% reduction in labor costs while improving service quality and employee satisfaction.</p>`,
			image:
				"https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
			author: {
				name: "Lauren Brown",
				avatar:
					"https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
				title: "Customer Success Manager",
				bio: "Lauren works directly with Scheduler's enterprise clients to ensure successful implementation and optimization of the platform for their specific needs.",
			},
			date: "November 12, 2023",
			readTime: "12 min read",
			category: "industry",
			tags: ["case study", "labor costs", "restaurant industry"],
			relatedPosts: ["3", "4"],
		},
	];

	// In a real application, this would be a fetch request to an API
	useEffect(() => {
		// Find the current post
		const currentPost = blogPosts.find((p) => p.id === postId);

		if (currentPost) {
			setPost(currentPost);

			// Get related posts if they exist
			if (currentPost.relatedPosts && currentPost.relatedPosts.length > 0) {
				const related = blogPosts.filter((p) =>
					currentPost.relatedPosts?.includes(p.id)
				);
				setRelatedPosts(related);
			}
		}
	}, [postId]);

	// Function to copy the current URL to clipboard
	const copyLinkToClipboard = () => {
		navigator.clipboard.writeText(window.location.href);
		alert("Link copied to clipboard!");
	};

	if (!post) {
		return (
			<AppContent>
				<div className="max-w-[900px] mx-auto px-4 py-16 text-center">
					<h1 className="text-2xl font-bold mb-4">Blog post not found</h1>
					<p className="mb-6">
						The blog post you're looking for doesn't exist or has been removed.
					</p>
					<Button asChild>
						<Link to="/blog">Return to Blog</Link>
					</Button>
				</div>
			</AppContent>
		);
	}

	return (
		<>
			<Helmet>
				<title>{post.title} | Scheduler Blog</title>
				<meta
					name="description"
					content={post.excerpt}
				/>
			</Helmet>
			<AppContent>
				<div className="max-w-[900px] mx-auto px-4 py-8">
					{/* Back to Blog */}
					<div className="mb-8">
						<Button
							variant="ghost"
							asChild
							className="pl-0 hover:pl-1 transition-all">
							<Link
								to="/blog"
								className="flex items-center gap-2">
								<ArrowLeft className="h-4 w-4" />
								Back to Blog
							</Link>
						</Button>
					</div>

					{/* Article Header */}
					<div className="mb-8">
						<div className="flex items-center gap-2 mb-4">
							<Badge>{post.category}</Badge>
							<span className="text-sm text-gray-500">{post.date}</span>
							<span className="text-sm text-gray-500">•</span>
							<span className="text-sm text-gray-500 flex items-center gap-1">
								<Clock className="h-4 w-4" /> {post.readTime}
							</span>
						</div>
						<h1 className="text-4xl font-bold mb-4">{post.title}</h1>
						<p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>

						{/* Author */}
						<div className="flex items-center gap-3">
							<Avatar className="h-12 w-12">
								<AvatarImage
									src={post.author.avatar}
									alt={post.author.name}
								/>
								<AvatarFallback>
									{post.author.name
										.split(" ")
										.map((n) => n[0])
										.join("")}
								</AvatarFallback>
							</Avatar>
							<div>
								<div className="font-medium">{post.author.name}</div>
								<div className="text-sm text-gray-500">{post.author.title}</div>
							</div>
						</div>
					</div>

					{/* Featured Image */}
					<div className="mb-8 rounded-lg overflow-hidden">
						<img
							src={post.image}
							alt={post.title}
							className="w-full h-auto object-cover"
						/>
					</div>

					{/* Social Share */}
					<div className="flex items-center gap-2 mb-8">
						<span className="text-sm font-medium mr-2">Share:</span>
						<Button
							variant="outline"
							size="icon"
							className="rounded-full h-8 w-8">
							<Twitter className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="rounded-full h-8 w-8">
							<Facebook className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="rounded-full h-8 w-8">
							<Linkedin className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="rounded-full h-8 w-8"
							onClick={copyLinkToClipboard}>
							<LinkIcon className="h-4 w-4" />
						</Button>
					</div>

					{/* Article Content */}
					<div
						className="prose prose-lg max-w-none mb-12"
						dangerouslySetInnerHTML={{ __html: post.content }}
					/>

					{/* Tags */}
					<div className="mb-12">
						<h3 className="text-lg font-semibold mb-3">Tags</h3>
						<div className="flex flex-wrap gap-2">
							{post.tags.map((tag) => (
								<Badge
									key={tag}
									variant="outline"
									className="px-3 py-1">
									{tag}
								</Badge>
							))}
						</div>
					</div>

					{/* Author Bio */}
					<div className="bg-gray-50 rounded-lg p-6 mb-12">
						<h3 className="text-lg font-semibold mb-4">About the Author</h3>
						<div className="flex flex-col md:flex-row gap-4 items-start">
							<Avatar className="h-16 w-16">
								<AvatarImage
									src={post.author.avatar}
									alt={post.author.name}
								/>
								<AvatarFallback>
									{post.author.name
										.split(" ")
										.map((n) => n[0])
										.join("")}
								</AvatarFallback>
							</Avatar>
							<div>
								<div className="font-medium mb-1">{post.author.name}</div>
								<div className="text-sm text-gray-500 mb-3">
									{post.author.title}
								</div>
								<p className="text-gray-600">{post.author.bio}</p>
							</div>
						</div>
					</div>

					{/* Related Articles */}
					{relatedPosts.length > 0 && (
						<div className="mb-12">
							<h2 className="text-2xl font-bold mb-6">Related Articles</h2>
							<div className="grid md:grid-cols-2 gap-6">
								{relatedPosts.map((relatedPost) => (
									<Card
										key={relatedPost.id}
										className="overflow-hidden flex flex-col h-full">
										<div className="aspect-[16/9] w-full overflow-hidden">
											<img
												src={relatedPost.image}
												alt={relatedPost.title}
												className="w-full h-full object-cover"
											/>
										</div>
										<CardHeader className="pb-2">
											<div className="flex items-center gap-2 mb-2">
												<Badge>{relatedPost.category}</Badge>
												<span className="text-sm text-gray-500">
													{relatedPost.readTime}
												</span>
											</div>
											<CardTitle className="text-xl hover:text-primary transition-colors">
												<Link to={`/blog/${relatedPost.id}`}>
													{relatedPost.title}
												</Link>
											</CardTitle>
										</CardHeader>
										<CardContent className="py-2 flex-grow">
											<CardDescription className="text-gray-600">
												{relatedPost.excerpt}
											</CardDescription>
										</CardContent>
										<CardFooter className="pt-2">
											<Button
												variant="link"
												asChild
												className="p-0">
												<Link
													to={`/blog/${relatedPost.id}`}
													className="flex items-center gap-1">
													Read Article <ArrowRight className="h-4 w-4" />
												</Link>
											</Button>
										</CardFooter>
									</Card>
								))}
							</div>
						</div>
					)}

					{/* Newsletter Signup */}
					<div className="bg-gray-50 rounded-lg p-8 text-center">
						<h2 className="text-2xl font-bold mb-3">Enjoyed this article?</h2>
						<p className="text-gray-600 mb-6 max-w-2xl mx-auto">
							Subscribe to our newsletter to receive more insights on
							scheduling, workforce management, and productivity.
						</p>
						<div className="flex max-w-md mx-auto">
							<input
								type="email"
								placeholder="Your email address"
								className="flex-grow rounded-l-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
							/>
							<Button className="rounded-l-none">Subscribe</Button>
						</div>
					</div>
				</div>
			</AppContent>
		</>
	);
}
