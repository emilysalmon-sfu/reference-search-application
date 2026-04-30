import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex h-10 items-center justify-center dark:bg-white dark:rounded-md dark:p-1">
                <AppLogoIcon className="h-10 w-auto" />
            </div>
        </>
    );
}
