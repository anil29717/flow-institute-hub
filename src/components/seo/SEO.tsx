import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    canonicalUrl?: string;
    ogType?: 'website' | 'article';
}

const defaultTitle = "InstiFlow - Complete Institute Management Software | CRM for Educational Institutes";
const defaultDescription = "InstiFlow is a comprehensive institute management software with multi-tenant architecture. Manage students, teachers, attendance, fees, and academics with role-based portals for owners, teachers, and parents. Start your free demo today!";
const defaultKeywords = "Institute Management Software, Educational ERP System, School Management System, Coaching Center Software, Institute CRM, Student Management System, Teacher Management Portal, Fee Management Software, Attendance Management System, Multi-tenant Institute Platform";

export function SEO({
    title = defaultTitle,
    description = defaultDescription,
    keywords = defaultKeywords,
    canonicalUrl = "https://instiflow.aimtech.in",
    ogType = "website"
}: SEOProps) {
    // Ensure we append the brand name if a custom title is provided, otherwise use the full default
    const formattedTitle = title === defaultTitle ? title : `${title} | InstiFlow`;

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{formattedTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={formattedTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content="https://storage.googleapis.com/gpt-engineer-file-uploads/Ev6qTKmoMzLdyi7q9mRuLkXI2Bm2/social-images/social-1772275367440-AZyj1oWSZW_9VYW303nEqg-AZyj1oWSocYi1cQtXKlLBg.webp" />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={canonicalUrl} />
            <meta property="twitter:title" content={formattedTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content="https://storage.googleapis.com/gpt-engineer-file-uploads/Ev6qTKmoMzLdyi7q9mRuLkXI2Bm2/social-images/social-1772275367440-AZyj1oWSZW_9VYW303nEqg-AZyj1oWSocYi1cQtXKlLBg.webp" />
        </Helmet>
    );
}
