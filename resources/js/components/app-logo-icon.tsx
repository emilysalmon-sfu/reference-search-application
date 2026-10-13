import { SVGAttributes } from 'react';
import logoUrl from '@/assets/Site_Logo.png';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <img 
            src={logoUrl} 
            width={975}
            height={194}
            alt="Project Logo"
            className="w-full h-full object-contain"
            {...props}
        />
    );
}
