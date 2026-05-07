import Logo from '../assets/Logo.png';

const Navbar = ({ navItems = [], activePath = '#/' }) => {

    return (
        <header className="sticky top-0 z-50 w-full bg-[#FCFCF7] border-b border-gray-200 backdrop-blur">
            <div className="mx-auto flex max-w-1xl items-center justify-between gap-6 px-5 sm:px-8">
                <a href="#/" className="flex items-center gap-2 select-none" aria-label="TripSter home">
                    <img className="h-16 w-16 object-contain sm:h-20 sm:w-20" src={Logo} alt="TripSter logo" />
                    <h1 className="text-2xl font-extrabold tracking-tight text-emerald-700 sm:text-4xl">
                        TripSter
                    </h1>
                </a>

                <nav className="hidden items-center gap-8 md:flex">
                    {navItems.map((item) => (
                        <a
                            key={item.path}
                            href={item.path}
                            className={`text-2xl font-semibold transition-colors duration-200 ${
                                activePath === item.path
                                    ? 'text-emerald-700'
                                    : 'text-gray-700 hover:text-emerald-600'
                            }`}
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                <a
                    href="#/profile"
                    className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-emerald-600 sm:px-7 sm:text-base"
                >
                    Sign up
                </a>
            </div>
        </header>
    )
}

export default Navbar
