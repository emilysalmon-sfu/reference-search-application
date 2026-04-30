import PublicLayout from '@/layouts/public-layout';
import { Head } from '@inertiajs/react';
import frameworkImage from '@/assets/framework-image.png';

export default function Introduction() {
    return (
        <PublicLayout>
            <Head title="Introduction" />
            <div className="mx-auto max-w-5xl px-4 py-8">
                {/* Main Title */}
                <h1 className="mb-8 text-3xl font-bold text-foreground">
                    Shelh tst, kws t'akw' tst: Navigating Indigenous Management & Organizational Studies Research
                </h1>

                {/* Introduction Text */}
                <div className="mb-10 space-y-6 text-base leading-relaxed text-muted-foreground">
                    <p>
                        <span className="font-semibold text-foreground">Finding Our Way</span> is a living, searchable database of Indigenous Management and Organizational Studies research. Its intention is to support respectful engagement with Indigenous-focused scholarship by making existing work more visible, accessible, and connected across disciplines, institutions, and communities. Grounded in relational accountability, the site is designed to help students, scholars, and practitioners find their way through a growing and diverse body of research, while encouraging thoughtful use, reflection, and dialogue. As a living resource, contributors are invited to suggest additional sources for inclusion, helping ensure the database continues to grow in ways that reflect the breadth, depth, and ongoing evolution of Indigenous management scholarship.
                    </p>
                    <p>
                        The name <strong>Shelh tst, kws t’akw’ tst</strong> was suggested and articulated by {' '}
                        <a
                            href="https://harbourpublishing.com/products/9781550179453?srsltid=AfmBOopHRNGGhlimazf6Y85TgnlwcAOCoLYt7O1Lnjc4I8FhcmoNjRrG"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                        >Luschiim</a> and {' '}
                        <a
                            href="https://www.qwustenuxun.com/qwustenuxun-bio"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                        >
                            Qwustenuxun
                        </a>, respected Quw'utsun advisors and relatives, and means <strong>“your path back home”</strong>. This name was chosen as it reflects a shared experience for many Indigenous scholars and practitioners - a process of unlearning colonial approaches to management, while navigating our way back to our own cultural knowledges and practices. We hope this resource supports you along that path by helping you locate relevant bodies of work and connect with a broader community of scholars and practitioners on similar journeys. As a living resource, we also invite you to contribute by suggesting additional sources, including your own published work, so that this collective map continues to grow and strengthen over time.
                    </p>
                    <h2 className='text-2xl text-foreground font-semibold'>Navigating the Database</h2>
                    <p>
                        To help people navigate this growing and sometimes overwhelming body of Indigenous Management and Organizational Studies research, this website uses a research framework developed in{' '}
                        <a
                            href="https://doi.org/10.5465/annals.2021.0132"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                        >
                            Salmon, Chavez, &amp; Murphy (2023)
                        </a>
                        . The framework groups research into broad topic areas, shown in the outer circle, and more specific subthemes, shown in the smaller circles. By organizing the literature in this way, the framework helps users not only find relevant research more easily, but also better understand how different pieces of work are connected, and how they approach Indigenous management in different ways.
                    </p>
                </div>

                {/* Framework Image */}
                <div className="mb-10 flex justify-center">
                    <img
                        src={frameworkImage}
                        alt="Research Framework Illustration"
                        className="max-w-2xl w-full h-auto rounded-lg shadow-md"
                    />
                </div>

                {/* Framework Table */}
                <div className="mb-8 overflow-x-auto">
                    <table className="w-full border-collapse border border-border">
                        <thead>
                            <tr className="bg-muted">
                                <th className="border border-border bg-[#41665B] p-4 text-left font-semibold text-white">
                                    Indigenous Ways of Being
                                </th>
                                <th className="border border-border bg-[#CA7447] p-4 text-left font-semibold text-white">
                                    Indigenous Organizing
                                </th>
                                <th className="border border-border bg-[#DECD9F] p-4 text-left font-semibold text-gray-900">
                                    Indigenous Relating
                                </th>
                                <th className="border border-border bg-[#B4B4C8] p-4 text-left font-semibold text-gray-900">
                                    Academic Implications
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-border bg-[#5D8A7E] p-4 align-top text-sm text-white">
                                    <span className="mb-2 block font-semibold text-white">Indigenous knowledges</span>
                                    research highlights place-based, holistic, and evolving knowledge systems that support sustainability, risk management, and adaptation, while grappling with challenges of translation, appropriation, and ethical use within dominant Western scientific and institutional frameworks.
                                </td>
                                <td className="border border-border bg-[#D9937A] p-4 align-top text-sm text-white">
                                    <span className="mb-2 block font-semibold text-white">Indigenous entrepreneurship</span>
                                    studies emphasize enterprise forms that integrate community values, social and environmental purpose, and diverse measures of success, while navigating structural constraints rooted in colonial legacies, policy environments, and market systems.
                                </td>
                                <td className="border border-border bg-[#E8DBBE] p-4 align-top text-sm text-gray-900">
                                    <span className="mb-2 block font-semibold text-gray-900">State Interactions</span>
                                    analyzes how colonial histories, public policies, and state institutions shape Indigenous experiences, governance capacity, and development outcomes, while also documenting Indigenous resistance, adaptation, and self-determined strategies.
                                </td>
                                <td className="border border-border bg-[#CBCBD8] p-4 align-top text-sm text-gray-900">
                                    <span className="mb-2 block font-semibold text-gray-900">Academic Implications</span>
                                    This literature reflects implications for teaching, research, and academic institutions. It (a) documents approaches to education that engage Indigenous worldviews, (b) examines research practices and methodologies, and (c) highlights how institutional structures shape the conditions for ethical, community-engaged Indigenous scholarship.
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-border bg-[#5D8A7E] p-4 align-top text-sm text-white">
                                    <span className="mb-2 block font-semibold text-white">Cultural values &amp; identity</span>
                                    research explores how Indigenous cultural values and identities shape sensemaking, behavior, and social organization, while also examining tensions arising from comparison with non-Indigenous cultures and the commodification, misrepresentation, or remediation of Indigenous identities in market contexts.
                                </td>
                                <td className="border border-border bg-[#D9937A] p-4 align-top text-sm text-white">
                                    <span className="mb-2 block font-semibold text-white">Indigenous leadership</span>
                                    conceptualizes leadership practices and motivations as relational, holistic, and culturally grounded, highlighting practices that sustain community wellbeing, steward values across generations, and contend with the pressures of operating within bicultural and often discriminatory contexts.
                                </td>
                                <td className="border border-border bg-[#E8DBBE] p-4 align-top text-sm text-gray-900">
                                    <span className="mb-2 block font-semibold text-gray-900">Firm interactions</span>
                                    investigates the varied relationships between Indigenous communities and businesses, ranging from extractive and conflictual engagements to partnership and co-management arrangements, with attention to impacts on Indigenous governance, culture, and wellbeing.
                                </td>
                                <td className="border border-border bg-[#CBCBD8] p-4 align-top text-sm text-gray-900" rowSpan={2}>
                                    {/* Empty cell to span the remaining rows in this column */}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-border bg-[#5D8A7E] p-4 align-top text-sm text-white">
                                    <span className="mb-2 block font-semibold text-white">Indigenous governance</span>
                                    literature examines Indigenous governance systems as resilient, value-driven, and multicriteria decision-making arrangements that integrate cultural, social, economic, and ecological considerations, particularly in relation to natural resource management and economic organization.
                                </td>
                                <td className="border border-border bg-[#D9937A] p-4 align-top text-sm text-white">
                                    <span className="mb-2 block font-semibold text-white">Indigenous management</span>
                                    research explores distinct managerial practices and organizational logics that reflect Indigenous worldviews, including collective decision-making, strategic planning, and the integration of cultural values into everyday organizational life.
                                </td>
                                <td className="border border-border bg-[#E8DBBE] p-4 align-top text-sm text-gray-900">
                                    <span className="mb-2 block font-semibold text-gray-900">Indigenous economic development</span>
                                    literature examines pathways through which Indigenous Nations pursue self-determined, culturally grounded, and sustainable economic futures, emphasizing sovereignty, community wellbeing, and long-term value creation over narrowly defined growth or profit-based outcomes.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Note */}
                <p className="text-sm italic text-muted-foreground">
                    <span className="font-semibold">Note:</span> While each paper is categorized within one primary theme, many speak to multiple areas, so readers are encouraged to explore related or connected subthemes to follow these connections.
                </p>
            </div>
        </PublicLayout>
    );
}
