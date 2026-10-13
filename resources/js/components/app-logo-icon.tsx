import { SVGAttributes } from 'react';
import logoUrl from '@/assets/Site_Logo.webp';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <img 
            src={logoUrl} 
            width={603}
            height={120}
            alt="Project Logo"
            className="w-full h-full object-contain"
            {...props}
        />
    );
}
