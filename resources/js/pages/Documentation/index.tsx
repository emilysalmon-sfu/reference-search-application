import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    LayoutGrid, 
    Search, 
    Upload, 
    NotebookPen, 
    ListCheck, 
    User, 
    Settings, 
    Download,
    FileSpreadsheet,
    ShieldCheck,
    UserCog,
    MessageSquare,
    Palette,
    Copy,
    Route
} from 'lucide-react';

interface FeatureSection {
    title: string;
    icon: React.ReactNode;
    description: string;
    features: {
        name: string;
        description: string;
        badge?: string;
        badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
    }[];
}

const featureSections: FeatureSection[] = [
    {
        title: 'Dashboard',
        icon: <LayoutGrid className="h-5 w-5" />,
        description: 'Overview of system statistics and quick insights.',
        features: [
            {
                name: 'Pending Approvals Counter',
                description: 'Shows the number of articles awaiting approval.',
            },
            {
                name: 'Last Import Information',
                description: 'Displays the date of the most recent file import and the number of articles created.',
            },
            {
                name: 'Articles Without Year',
                description: 'Quick count of approved articles missing publication year data.',
            },
            {
                name: 'Unresolved Feedback Counter',
                description: 'Shows the number of pending feedback/reports from users.',
            },
            {
                name: 'Time-Filtered Statistics',
                description: 'View downloads, user submissions, and admin articles filtered by time period (24h, week, month, etc.).',
            },
        ],
    },
    {
        title: 'Public Search',
        icon: <Search className="h-5 w-5" />,
        description: 'Public-facing article search functionality.',
        features: [
            {
                name: 'Multi-Field Search',
                description: 'Search articles by author, title, journal, keywords, abstract, country, and type of study.',
            },
            {
                name: 'Year Range Filter',
                description: 'Filter results by publication year range.',
            },
            {
                name: 'Theme & Sub-theme Filtering',
                description: 'Browse articles organized by themes and sub-themes.',
            },
            {
                name: 'Article Suggestion',
                description: 'Public users can suggest new articles for review and approval.',
            },
            {
                name: 'Report/Feedback Button',
                description: 'Users can submit feedback or report issues directly from the public search page.',
            },
            {
                name: 'Export Results',
                description: 'Download search results as an Excel spreadsheet.',
            },
        ],
    },
    {
        title: 'File Upload (Import)',
        icon: <Upload className="h-5 w-5" />,
        description: 'Bulk import articles from Excel spreadsheets.',
        features: [
            {
                name: 'Excel File Import',
                description: 'Upload .xlsx or .xls files to bulk import articles into the database.',
            },
            {
                name: 'Configurable Column Mapping',
                description: 'Map spreadsheet columns to database fields via Settings.',
            },
            {
                name: 'Duplicate Detection',
                description: 'Automatically detects and skips duplicate articles based on author, title, and year.',
            },
            {
                name: 'Year Validation',
                description: 'Non-numeric year values (e.g., "Forthcoming") are automatically set to null.',
            },
        ],
    },
    {
        title: 'Articles Management',
        icon: <NotebookPen className="h-5 w-5" />,
        description: 'Full CRUD operations for article management.',
        features: [
            {
                name: 'View All Articles',
                description: 'Paginated list of all articles in the system with sorting capabilities.',
            },
            {
                name: 'Quick Search',
                description: 'Search articles by title, author, journal, or keywords.',
            },
            {
                name: 'Missing Year Filter',
                description: 'Filter to show only articles without a publication year for easy data cleanup.',
            },
            {
                name: 'Add/Edit Articles',
                description: 'Create new articles or edit existing ones with full field control.',
            },
            {
                name: 'Delete Articles',
                description: 'Remove articles from the database with confirmation.',
            },
            {
                name: 'DOI Links',
                description: 'Quick access to article DOI links when available.',
            },
        ],
    },
    {
        title: 'Approvals',
        icon: <ListCheck className="h-5 w-5" />,
        description: 'Review and approve user-submitted articles.',
        features: [
            {
                name: 'Pending Queue',
                description: 'View all articles submitted by public users awaiting approval.',
            },
            {
                name: 'Approve with Edits',
                description: 'Review article details and make edits before approving.',
            },
            {
                name: 'Reject Submissions',
                description: 'Reject inappropriate or duplicate submissions.',
            },
        ],
    },
    {
        title: 'Feedback Management',
        icon: <MessageSquare className="h-5 w-5" />,
        description: 'View and manage user feedback and reports.',
        features: [
            {
                name: 'View All Feedback',
                description: 'Paginated list of all feedback submitted by users with search functionality.',
            },
            {
                name: 'View Details',
                description: 'Open a modal to see the full feedback message, user email, and submission date.',
            },
            {
                name: 'Resolve/Unresolve',
                description: 'Mark feedback as resolved or reopen it if needed, with confirmation dialogs.',
            },
            {
                name: 'Delete Feedback',
                description: 'Remove feedback entries from the system with confirmation.',
            },
            {
                name: 'Spam Protection',
                description: 'Rate limiting protect against spam submissions.',
            },
        ],
    },
    {
        title: 'User Management',
        icon: <User className="h-5 w-5" />,
        description: 'Manage admin users and their access levels.',
        features: [
            {
                name: 'View All Users',
                description: 'List of all admin users with their roles.',
                badge: 'Admin Only',
                badgeVariant: 'secondary',
            },
            {
                name: 'Create Users',
                description: 'Add new admin or approver users to the system.',
                badge: 'Admin Only',
                badgeVariant: 'secondary',
            },
            {
                name: 'Edit Users',
                description: 'Update user information and change roles.',
                badge: 'Admin Only',
                badgeVariant: 'secondary',
            },
            {
                name: 'Password Reset',
                description: 'Send password reset links to users.',
                badge: 'Admin Only',
                badgeVariant: 'secondary',
            },
            {
                name: 'Delete Users',
                description: 'Remove users from the system (cannot delete yourself).',
                badge: 'Admin Only',
                badgeVariant: 'secondary',
            },
        ],
    },
    {
        title: 'Settings (Configuration)',
        icon: <Settings className="h-5 w-5" />,
        description: 'Configure system settings for imports and display.',
        features: [
            {
                name: 'Worksheet Name',
                description: 'Specify which worksheet/sheet name to read from imported Excel files.',
                badge: 'Admin Only',
                badgeVariant: 'secondary',
            },
            {
                name: 'Column Mapping',
                description: 'Map Excel column headers to article database fields (author, title, year, journal, keywords, etc.).',
                badge: 'Admin Only',
                badgeVariant: 'secondary',
            },
            {
                name: 'Type of Study Badge Colors',
                description: 'Configure the background and text colors for each type of study badge displayed throughout the application.',
                badge: 'Admin Only',
                badgeVariant: 'secondary',
            },
        ],
    },
];

const roleInfo = [
    {
        role: 'Admin',
        description: 'Full access to all features including user management, settings, and all article operations.',
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    },
    {
        role: 'Approver',
        description: 'Access to dashboard, search, upload, articles, and approvals. Cannot manage users or change settings.',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    },
];

export default function Documentation() {
    return (
        <AppLayout>
            <div className="space-y-8 px-4 sm:px-6 lg:px-8 pb-12">
                {/* Header */}
                <div className="border-b pb-4 mt-6">
                    <h1 className="text-4xl font-bold tracking-tight">Documentation</h1>
                    <p className="text-base text-muted-foreground mt-3">
                        Complete guide to all features and functionalities of the Reference Search Application.
                    </p>
                </div>

                {/* Role Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5" />
                            User Roles
                        </CardTitle>
                        <CardDescription>
                            Understanding the two user roles and their permissions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            {roleInfo.map((info) => (
                                <div key={info.role} className="p-4 rounded-lg border bg-card">
                                    <div className="flex items-center gap-2 mb-2">
                                        <UserCog className="h-4 w-4 text-muted-foreground" />
                                        <Badge className={info.color}>{info.role}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{info.description}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Feature Sections */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold tracking-tight">Features Overview</h2>
                    
                    {featureSections.map((section) => (
                        <Card key={section.title}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {section.icon}
                                    {section.title}
                                </CardTitle>
                                <CardDescription>{section.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {section.features.map((feature, index) => (
                                        <div 
                                            key={index} 
                                            className="flex flex-col sm:flex-row sm:items-start gap-2 p-3 rounded-md bg-muted/50"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-medium text-foreground">
                                                        {feature.name}
                                                    </span>
                                                    {feature.badge && (
                                                        <Badge 
                                                            variant={feature.badgeVariant || 'default'}
                                                            className="text-xs"
                                                        >
                                                            {feature.badge}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Quick Tips */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5" />
                            Import Tips
                        </CardTitle>
                        <CardDescription>
                            Best practices for importing articles from Excel files.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                Ensure your Excel file has a header row with column names matching your configuration.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                Years should be 4-digit numbers (e.g., 2024). Non-numeric values will be set to null.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                Duplicate articles (same author, title, and year) are automatically skipped.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                Keywords can be separated by line breaks within a single cell.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                Use the Settings page to configure column mappings before importing.
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Export Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5" />
                            Exporting Data
                        </CardTitle>
                        <CardDescription>
                            How to export search results and article data.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                Use the "Export" button on the public search page to download results as Excel.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                Apply filters first to export only the articles you need.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                Exported files include all article fields: author, title, year, journal, keywords, abstract, DOI, theme, and more.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                Download counts are tracked in the dashboard statistics.
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                {/* API Routes Reference */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Route className="h-5 w-5" />
                            Routes Reference
                        </CardTitle>
                        <CardDescription>
                            Technical reference for developers - all available routes in the application.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Public Routes */}
                        <div>
                            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                    Public
                                </Badge>
                                Public Routes (No Authentication)
                            </h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2 px-3 font-medium text-muted-foreground">Method</th>
                                            <th className="text-left py-2 px-3 font-medium text-muted-foreground">Route</th>
                                            <th className="text-left py-2 px-3 font-medium text-muted-foreground">Name</th>
                                            <th className="text-left py-2 px-3 font-medium text-muted-foreground">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-muted-foreground">
                                        <tr className="border-b border-muted/50">
                                            <td className="py-2 px-3"><Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100">GET</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/</td>
                                            <td className="py-2 px-3 font-mono text-xs">articlesIndex</td>
                                            <td className="py-2 px-3">Public search page</td>
                                        </tr>
                                        <tr className="border-b border-muted/50">
                                            <td className="py-2 px-3"><Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100">GET</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/articles/search</td>
                                            <td className="py-2 px-3 font-mono text-xs">queryArticles</td>
                                            <td className="py-2 px-3">Search articles (public)</td>
                                        </tr>
                                        <tr className="border-b border-muted/50">
                                            <td className="py-2 px-3"><Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-100">POST</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/articles</td>
                                            <td className="py-2 px-3 font-mono text-xs">submitForApproval</td>
                                            <td className="py-2 px-3">Submit article for approval</td>
                                        </tr>
                                        <tr className="border-b border-muted/50">
                                            <td className="py-2 px-3"><Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-100">POST</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/report-feedback</td>
                                            <td className="py-2 px-3 font-mono text-xs">reportFeedback</td>
                                            <td className="py-2 px-3">Submit feedback/report</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 px-3"><Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100">GET</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/export</td>
                                            <td className="py-2 px-3 font-mono text-xs">fileExport</td>
                                            <td className="py-2 px-3">Export search results to Excel</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Authenticated Routes */}
                        <div>
                            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                    Auth
                                </Badge>
                                Authenticated Routes (Admin & Approver)
                            </h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2 px-3 font-medium text-muted-foreground">Method</th>
                                            <th className="text-left py-2 px-3 font-medium text-muted-foreground">Route</th>
                                            <th className="text-left py-2 px-3 font-medium text-muted-foreground">Name</th>
                                            <th className="text-left py-2 px-3 font-medium text-muted-foreground">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-muted-foreground">
                                        <tr className="border-b border-muted/50">
                                            <td className="py-2 px-3"><Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100">GET</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/admin/dashboard</td>
                                            <td className="py-2 px-3 font-mono text-xs">dashboard</td>
                                            <td className="py-2 px-3">Admin dashboard</td>
                                        </tr>
                                        <tr className="border-b border-muted/50">
                                            <td className="py-2 px-3"><Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100">GET</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/admin/dashboard/stats</td>
                                            <td className="py-2 px-3 font-mono text-xs">dashboardStats</td>
                                            <td className="py-2 px-3">Get filtered dashboard stats</td>
                                        </tr>
                                        <tr className="border-b border-muted/50">
                                            <td className="py-2 px-3"><Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100">GET</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/admin/documentation</td>
                                            <td className="py-2 px-3 font-mono text-xs">documentation</td>
                                            <td className="py-2 px-3">Documentation page</td>
                                        </tr>
                                        <tr className="border-b border-muted/50">
                                            <td className="py-2 px-3"><Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100">GET</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/admin/upload</td>
                                            <td className="py-2 px-3 font-mono text-xs">fileUploadIndex</td>
                                            <td className="py-2 px-3">File upload page</td>
                                        </tr>
                                        <tr className="border-b border-muted/50">
                                            <td className="py-2 px-3"><Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-100">POST</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/admin/upload</td>
                                            <td className="py-2 px-3 font-mono text-xs">fileUpload</td>
                                            <td className="py-2 px-3">Upload Excel file</td>
                                        </tr>
                                        <tr className="border-b border-muted/50">
                                            <td className="py-2 px-3"><Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100">GET</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/admin/approvals</td>
                                            <td className="py-2 px-3 font-mono text-xs">approvalsIndex</td>
                                            <td className="py-2 px-3">Approvals queue</td>
                                        </tr>
                                        <tr className="border-b border-muted/50">
                                            <td className="py-2 px-3"><Badge className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 hover:bg-yellow-100">PUT</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/admin/approvals/{'{article}'}/approve</td>
                                            <td className="py-2 px-3 font-mono text-xs">approvalsApprove</td>
                                            <td className="py-2 px-3">Approve an article</td>
                                        </tr>
                                        <tr className="border-b border-muted/50">
                                            <td className="py-2 px-3"><Badge className="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-100">DELETE</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/admin/approvals/{'{article}'}/reject</td>
                                            <td className="py-2 px-3 font-mono text-xs">approvalsReject</td>
                                            <td className="py-2 px-3">Reject an article</td>
                                        </tr>
                                        <tr className="border-b border-muted/50">
                                            <td className="py-2 px-3"><Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100">GET</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/admin/articles/list</td>
                                            <td className="py-2 px-3 font-mono text-xs">articlesList</td>
                                            <td className="py-2 px-3">List all articles</td>
                                        </tr>
                                        <tr className="border-b border-muted/50">
                                            <td className="py-2 px-3"><Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100">GET</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/admin/articles/search</td>
                                            <td className="py-2 px-3 font-mono text-xs">searchArticlesList</td>
                                            <td className="py-2 px-3">Search articles (admin)</td>
                                        </tr>
                                        <tr className="border-b border-muted/50">
                                            <td className="py-2 px-3"><Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100">GET</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/admin/articles/new</td>
                                            <td className="py-2 px-3 font-mono text-xs">articlesCreate</td>
                                            <td className="py-2 px-3">Create article page</td>
                                        </tr>
                                        <tr className="border-b border-muted/50">
                                            <td className="py-2 px-3"><Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-100">POST</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/admin/articles</td>
                                            <td className="py-2 px-3 font-mono text-xs">articlesStoreFromAdmin</td>
                                            <td className="py-2 px-3">Store new article</td>
                                        </tr>
                                        <tr className="border-b border-muted/50">
                                            <td className="py-2 px-3"><Badge className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 hover:bg-yellow-100">PUT</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/admin/articles/{'{article}'}</td>
                                            <td className="py-2 px-3 font-mono text-xs">articlesUpdate</td>
                                            <td className="py-2 px-3">Update an article</td>
                                        </tr>
                                        <tr className="border-b border-muted/50">
                                            <td className="py-2 px-3"><Badge className="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-100">DELETE</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/admin/articles/{'{article}'}</td>
                                            <td className="py-2 px-3 font-mono text-xs">articlesDestroy</td>
                                            <td className="py-2 px-3">Delete an article</td>
                                        </tr>
                                        <tr className="border-b border-muted/50">
                                            <td className="py-2 px-3"><Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100">GET</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/admin/feedbacks</td>
                                            <td className="py-2 px-3 font-mono text-xs">feedbacksIndex</td>
                                            <td className="py-2 px-3">List all feedback</td>
                                        </tr>
                                        <tr className="border-b border-muted/50">
                                            <td className="py-2 px-3"><Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100">GET</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/admin/feedbacks/search</td>
                                            <td className="py-2 px-3 font-mono text-xs">feedbacksSearch</td>
                                            <td className="py-2 px-3">Search feedback</td>
                                        </tr>
                                        <tr className="border-b border-muted/50">
                                            <td className="py-2 px-3"><Badge className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 hover:bg-orange-100">PATCH</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/admin/feedbacks/{'{feedback}'}/resolve</td>
                                            <td className="py-2 px-3 font-mono text-xs">feedbacksResolve</td>
                                            <td className="py-2 px-3">Mark feedback as resolved</td>
                                        </tr>
                                        <tr className="border-b border-muted/50">
                                            <td className="py-2 px-3"><Badge className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 hover:bg-orange-100">PATCH</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/admin/feedbacks/{'{feedback}'}/unresolve</td>
                                            <td className="py-2 px-3 font-mono text-xs">feedbacksUnresolve</td>
                                            <td className="py-2 px-3">Mark feedback as unresolved</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 px-3"><Badge className="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-100">DELETE</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/admin/feedbacks/{'{feedback}'}</td>
                                            <td className="py-2 px-3 font-mono text-xs">feedbacksDestroy</td>
                                            <td className="py-2 px-3">Delete feedback</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Admin Only Routes */}
                        <div>
                            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                    Admin Only
                                </Badge>
                                Admin-Only Routes
                            </h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2 px-3 font-medium text-muted-foreground">Method</th>
                                            <th className="text-left py-2 px-3 font-medium text-muted-foreground">Route</th>
                                            <th className="text-left py-2 px-3 font-medium text-muted-foreground">Name</th>
                                            <th className="text-left py-2 px-3 font-medium text-muted-foreground">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-muted-foreground">
                                        <tr className="border-b border-muted/50">
                                            <td className="py-2 px-3"><Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100">GET</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/admin/users</td>
                                            <td className="py-2 px-3 font-mono text-xs">usersIndex</td>
                                            <td className="py-2 px-3">List all users</td>
                                        </tr>
                                        <tr className="border-b border-muted/50">
                                            <td className="py-2 px-3"><Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100">GET</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/admin/users/search</td>
                                            <td className="py-2 px-3 font-mono text-xs">usersSearch</td>
                                            <td className="py-2 px-3">Search users</td>
                                        </tr>
                                        <tr className="border-b border-muted/50">
                                            <td className="py-2 px-3"><Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-100">POST</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/admin/users</td>
                                            <td className="py-2 px-3 font-mono text-xs">usersStore</td>
                                            <td className="py-2 px-3">Create new user</td>
                                        </tr>
                                        <tr className="border-b border-muted/50">
                                            <td className="py-2 px-3"><Badge className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 hover:bg-yellow-100">PUT</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/admin/users/{'{user}'}</td>
                                            <td className="py-2 px-3 font-mono text-xs">usersUpdate</td>
                                            <td className="py-2 px-3">Update user</td>
                                        </tr>
                                        <tr className="border-b border-muted/50">
                                            <td className="py-2 px-3"><Badge className="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-100">DELETE</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/admin/users/{'{user}'}</td>
                                            <td className="py-2 px-3 font-mono text-xs">usersDestroy</td>
                                            <td className="py-2 px-3">Delete user</td>
                                        </tr>
                                        <tr className="border-b border-muted/50">
                                            <td className="py-2 px-3"><Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-100">POST</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/admin/users/{'{user}'}/reset-password</td>
                                            <td className="py-2 px-3 font-mono text-xs">usersSendPasswordReset</td>
                                            <td className="py-2 px-3">Send password reset email</td>
                                        </tr>
                                        <tr className="border-b border-muted/50">
                                            <td className="py-2 px-3"><Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100">GET</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/admin/config</td>
                                            <td className="py-2 px-3 font-mono text-xs">configIndex</td>
                                            <td className="py-2 px-3">Settings page</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 px-3"><Badge className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 hover:bg-yellow-100">PUT</Badge></td>
                                            <td className="py-2 px-3 font-mono text-xs">/admin/config/update</td>
                                            <td className="py-2 px-3 font-mono text-xs">configUpdate</td>
                                            <td className="py-2 px-3">Update settings</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground italic mt-4">
                            Note: Route parameters are shown in curly braces (e.g., {'{article}'} represents the article ID).
                            All routes are defined in <span className="font-mono">routes/web.php</span>.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
