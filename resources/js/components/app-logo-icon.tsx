import { SVGAttributes } from 'react';
import logoUrl from '@/assets/Site_Logo.png';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <img 
            src={logoUrl} 
            alt="Project Logo"
            className="w-full h-full object-contain"
            {...props}
        />
    );
}
