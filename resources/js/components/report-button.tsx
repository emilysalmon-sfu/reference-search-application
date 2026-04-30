import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquarePlus, Loader2, CheckCircle } from 'lucide-react';

const COOLDOWN_KEY = 'feedback_last_submitted';
const COOLDOWN_DURATION = 60000; // 1 minute cooldown between submissions

export default function ReportButton() {
    const [open, setOpen] = useState(false);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        comment: '',
        website: '', // Honeypot field - should remain empty
    });

    // Check and update cooldown timer
    useEffect(() => {
        const checkCooldown = () => {
            const lastSubmitted = localStorage.getItem(COOLDOWN_KEY);
            if (lastSubmitted) {
                const elapsed = Date.now() - parseInt(lastSubmitted, 10);
                const remaining = Math.max(0, COOLDOWN_DURATION - elapsed);
                setCooldownRemaining(Math.ceil(remaining / 1000));
            }
        };

        checkCooldown();
        const interval = setInterval(checkCooldown, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Check cooldown
        if (cooldownRemaining > 0) {
            return;
        }
        
        post('/report-feedback', {
            preserveScroll: true,
            onSuccess: () => {
                // Set cooldown
                localStorage.setItem(COOLDOWN_KEY, Date.now().toString());
                setCooldownRemaining(Math.ceil(COOLDOWN_DURATION / 1000));
                
                // Show success state briefly
                setSubmitted(true);
                setTimeout(() => {
                    reset();
                    setOpen(false);
                    setSubmitted(false);
                }, 1500);
            },
            onError: (errors) => {
                console.error('Submission errors:', errors);
            },
        });
    };

    const isDisabled = processing || cooldownRemaining > 0;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <MessageSquarePlus className="h-4 w-4" />
                    Report a problem/Have a suggestion?
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                {submitted ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                        <h3 className="text-lg font-semibold">Thank you!</h3>
                        <p className="text-muted-foreground">Your feedback has been submitted.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Report a Problem or Suggestion</DialogTitle>
                            <DialogDescription>
                                Please share your feedback with us. We'll review it and get back to you as soon as possible.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            {/* Honeypot field - hidden from users, bots will fill it */}
                            <input
                                type="text"
                                name="website"
                                value={data.website}
                                onChange={(e) => setData('website', e.target.value)}
                                autoComplete="off"
                                tabIndex={-1}
                                aria-hidden="true"
                                style={{ 
                                    position: 'absolute', 
                                    left: '-9999px', 
                                    opacity: 0,
                                    height: 0,
                                    width: 0,
                                }}
                            />
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter your name"
                                    required
                                    disabled={isDisabled}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    disabled={isDisabled}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">{errors.email}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="comment">Comment</Label>
                                <Textarea
                                    id="comment"
                                    value={data.comment}
                                    onChange={(e) => setData('comment', e.target.value)}
                                    placeholder="Describe the problem or share your suggestion... (min 10 characters)"
                                    className="min-h-[120px]"
                                    required
                                    minLength={10}
                                    disabled={isDisabled}
                                />
                                {errors.comment && (
                                    <p className="text-sm text-red-500">{errors.comment}</p>
                                )}
                            </div>
                            {cooldownRemaining > 0 && (
                                <p className="text-sm text-amber-600">
                                    Please wait {cooldownRemaining} seconds before submitting again.
                                </p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isDisabled}>
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : cooldownRemaining > 0 ? (
                                    `Wait ${cooldownRemaining}s`
                                ) : (
                                    'Submit'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
