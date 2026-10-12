import PublicLayout from '@/layouts/public-layout';

export default function Privacy() {
    return (
        <PublicLayout title="Privacy">
            <div className="mx-auto max-w-3xl px-4 py-8">
                <h1 className="mb-6 text-3xl font-bold text-foreground">Privacy</h1>
                <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
                    <p>
                        IndigiMOS collects anonymous usage statistics to understand how the site is used and to improve it. We record visits,
                        the searches people run, the visitor's country, the website that referred them, and the type of device (desktop or
                        mobile).
                    </p>
                    <p>
                        We do not use cookies for this, we do not store IP addresses, and we cannot recognise the same visitor from one day to
                        the next. These statistics stay on the site's own server and are not shared with third parties.
                    </p>
                </div>
            </div>
        </PublicLayout>
    );
}
