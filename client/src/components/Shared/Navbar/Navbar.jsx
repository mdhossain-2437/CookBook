import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";
import { FaSearch } from "react-icons/fa";
import {
	FaUserCircle,
	FaSignOutAlt,
	FaSignInAlt,
	FaUserPlus,
	FaUtensils,	FaPlus,
} from "react-icons/fa";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { Tooltip } from "react-tooltip";
import useAuth from "../../../hooks/useAuth";
import useTheme from "../../../hooks/useTheme";
import { Button } from "../../ui/button";
import GlowingButton from "../../animations/GlowingButton";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

const Navbar = () => {
	const [menuOpen, setMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const { user, logOut } = useAuth();
	const { theme, toggleTheme } = useTheme();
	const navigate = useNavigate();

	// Handle scroll effect
	useEffect(() => {
		const handleScroll = () => {
			const isScrolled = window.scrollY > 20;
			if (isScrolled !== scrolled) {
				setScrolled(isScrolled);
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [scrolled]);

	// Handle logout
	const handleLogOut = () => {
		logOut()
			.then(() => {
				navigate("/");
			})
			.catch((error) => {
				console.error("Logout error:", error);
			});
	};

	// Toggle mobile menu
	const toggleMenu = () => {
		setMenuOpen(!menuOpen);
	};

	// Handle search
	const handleSearch = (e) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			navigate(`/all-recipes?search=${encodeURIComponent(searchQuery.trim())}`);
			setSearchQuery("");
		}
	};

	// Navigation links
	const navLinks = [
		{ to: "/", label: "Home" },
		{ to: "/all-recipes", label: "All Recipes" },
		{ to: "/cuisines", label: "Cuisines" },
	];

	// Protected links (only for logged in users)
	const protectedLinks = [
		{
			to: "/add-recipe",
			label: "Add Recipe",
			icon: <FaPlus className="mr-2" />,
		},
		{
			to: "/my-recipes",
			label: "My Recipes",
			icon: <FaUtensils className="mr-2" />,
		},
	];

	// Handle protected link click for non-authenticated users
	const handleProtectedLinkClick = (e, path) => {
		if (!user) {
			e.preventDefault();
			// Save the intended destination
			navigate("/login", { state: { from: { pathname: path } } });
		}
	};

	return (
		<header
			className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
				scrolled
					? "bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-lg border-b border-white/10 dark:border-neutral-800/30"
					: "bg-transparent"
			}`}
		>
			<div className="relative">
				{/* Decorative top border with gradient */}
				<div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-accent opacity-90"></div>

				{/* Decorative background elements */}
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					<div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-primary/5 dark:bg-primary/10 blur-3xl animate-pulse"></div>
					<div
						className="absolute -bottom-8 -left-16 w-72 h-72 rounded-full bg-secondary/5 dark:bg-secondary/10 blur-3xl animate-pulse"
						style={{ animationDuration: "8s" }}
					></div>
				</div>

				<div className="container mx-auto px-4 relative z-10">
					<div className="flex items-center justify-between py-4">
						{/* Logo - Left aligned */}
						<div className="flex-shrink-0">
							<Link to="/" className="flex items-center space-x-2 group">
								<div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg group-hover:shadow-primary/30 transition-all duration-300 relative overflow-hidden">
									<div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
									<span className="text-white font-bold text-xl relative z-10">
										R
									</span>
								</div>
								<span className="text-2xl font-serif font-bold">
									<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
										Recipe
									</span>
									<span className="text-neutral-800 dark:text-white">
										{" "}
										Book
									</span>
								</span>
							</Link>
						</div>

						{/* Desktop Navigation - Center aligned */}
						<div className="hidden md:flex items-center justify-center flex-1 px-4">
							<nav className="flex items-center">
								{/* Main Navigation Links */}
								<ul className="flex space-x-6">
									{navLinks.map((link) => (
									<li key={link.to}>
										<NavLink
											to={link.to}
											className={({ isActive, isPending }) =>
												`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
													isActive
														? "text-white bg-gradient-to-r from-primary to-secondary shadow-md hover:shadow-primary/20"
														: isPending
														? "text-neutral-500 dark:text-neutral-400 bg-neutral-100/50 dark:bg-neutral-800/50"
														: "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 hover:text-primary dark:hover:text-primary-light"
												}`
											}
										>
											{link.label}
										</NavLink>
									</li>
								))}

									{/* Protected Links - Always visible but redirect to login if not authenticated */}
								{protectedLinks.map((link) => (
									<li key={link.to}>
										<NavLink
											to={link.to}
											onClick={(e) => handleProtectedLinkClick(e, link.to)}
											className={({ isActive, isPending }) =>
												`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
													isActive
														? "text-white bg-gradient-to-r from-primary to-secondary shadow-md hover:shadow-primary/20"
														: isPending
														? "text-neutral-500 dark:text-neutral-400 bg-neutral-100/50 dark:bg-neutral-800/50"
														: "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 hover:text-primary dark:hover:text-primary-light"
												}`
											}
										>
											{link.label}
										</NavLink>
									</li>
								))}
								</ul>
							</nav>
						</div>

						{/* Right Side: Theme Toggle + User Menu */}
						<div className="hidden md:flex items-center space-x-4">
							{/* Theme Toggle Button */}
							<motion.button
								onClick={toggleTheme}
								className="p-2 rounded-full bg-neutral-100/50 dark:bg-neutral-800/50 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200/70 dark:hover:bg-neutral-700/70 transition-colors duration-300 shadow-md hover:shadow-lg backdrop-blur-sm"
								whileHover={{ scale: 1.1, rotate: theme === "dark" ? 180 : 0 }}
								whileTap={{ scale: 0.9 }}
								data-tooltip-id="theme-tooltip"
								data-tooltip-content={
									theme === "dark"
										? "Switch to Light Mode"
										: "Switch to Dark Mode"
								}
								initial={{ rotate: theme === "dark" ? 180 : 0 }}
								animate={{ rotate: theme === "dark" ? 180 : 0 }}
								transition={{ duration: 0.5 }}
							>
								{theme === "dark" ? (
									<MdLightMode className="text-yellow-400" size={20} />
								) : (
									<MdDarkMode className="text-neutral-700" size={20} />
								)}
							</motion.button>
							<Tooltip id="theme-tooltip" place="bottom" />

							{/* User Menu or Login/Register Buttons */}
							<div>
								{user ? (
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												className="relative rounded-full h-10 w-10 overflow-hidden border-2 border-neutral-200 dark:border-neutral-700 hover:border-primary dark:hover:border-primary transition-colors duration-300 p-0 hover:shadow-md hover:shadow-primary/10"
												data-tooltip-id="user-tooltip"
												data-tooltip-content={user.displayName || "User"}
											>
												{user.photoURL ? (
													<img
														src={user.photoURL}
														alt={user.displayName || "User"}
														className="h-full w-full object-cover"
													/>
												) : (
													<FaUserCircle className="h-full w-full text-neutral-500 dark:text-neutral-400" />
												)}
												<span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-neutral-800"></span>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent
											align="end"
											className="w-56 mt-1 p-2 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 shadow-xl rounded-xl"
										>
											<div className="flex items-center gap-2 px-2 py-1.5">
												<div className="w-10 h-10 rounded-full overflow-hidden border-2 border-neutral-200 dark:border-neutral-700">
													{user.photoURL ? (
														<img
															src={user.photoURL}
															alt={user.displayName || "User"}
															className="h-full w-full object-cover"
														/>
													) : (
														<FaUserCircle className="h-full w-full text-neutral-500 dark:text-neutral-400" />
													)}
												</div>
												<div className="flex-1 overflow-hidden">
													<p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
														{user.displayName || "User"}
													</p>
													<p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
														{user.email}
													</p>
												</div>
											</div>

											<DropdownMenuSeparator className="my-1 bg-neutral-200 dark:bg-neutral-800" />

											<DropdownMenuItem asChild>
												<Link
													to="/profile"
													className="flex items-center px-2 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors hover:text-primary dark:hover:text-primary-light"
												>
													<FaUserCircle className="mr-2" /> Profile
												</Link>
											</DropdownMenuItem>

											<DropdownMenuItem asChild>
												<Link
													to="/settings"
													className="flex items-center px-2 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors hover:text-primary dark:hover:text-primary-light"
												>
													<svg
														className="w-4 h-4 mr-2"
														xmlns="http://www.w3.org/2000/svg"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="2"
														strokeLinecap="round"
														strokeLinejoin="round"
													>
														<circle cx="12" cy="12" r="3"></circle>
														<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
													</svg>{" "}
													Settings
												</Link>
											</DropdownMenuItem>

											<DropdownMenuSeparator className="my-1 bg-neutral-200 dark:bg-neutral-800" />

											<DropdownMenuItem asChild>
												<button
													onClick={handleLogOut}
													className="w-full flex items-center px-2 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
												>
													<FaSignOutAlt className="mr-2" /> Logout
												</button>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								) : (
										<div className="flex space-x-3">
											<Link to="/login">
												<Button
													className="h-10 px-5 border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 transition-colors duration-300 hover:border-primary dark:hover:border-primary-light backdrop-blur-sm bg-white/50 dark:bg-neutral-800/50"
													variant="outline"
												>
													<FaSignInAlt className="mr-2" /> Login
												</Button>
											</Link>
											<Link to="/register">
												<GlowingButton
													glowColor="rgba(255, 90, 95, 0.6)"
													className="h-10 px-5 bg-gradient-to-r from-primary to-secondary text-white border-none transition-all duration-300 shadow-md hover:shadow-primary/20 text-sm rounded-md font-medium flex items-center"
												>
													<FaUserPlus className="mr-2" /> Register
												</GlowingButton>
											</Link>
										</div>
								)
							}
							</div>




						</div>

						{/* Mobile Menu Toggle */}
						<div className="md:hidden flex items-center space-x-4">
							{/* Mobile Search Button */}
							<Link
								to="/all-recipes"
								className="p-2 rounded-full bg-neutral-100/50 dark:bg-neutral-800/50 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200/70 dark:hover:bg-neutral-700/70 transition-colors duration-300 shadow-md backdrop-blur-sm"
							>
								<FaSearch size={18} />
							</Link>

							{/* Theme Toggle Button */}
							<motion.button
								onClick={toggleTheme}
								className="p-2 rounded-full bg-neutral-100/50 dark:bg-neutral-800/50 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200/70 dark:hover:bg-neutral-700/70 transition-colors duration-300 shadow-md backdrop-blur-sm"
								whileTap={{ scale: 0.9 }}
								animate={{ rotate: theme === "dark" ? 180 : 0 }}
								transition={{ duration: 0.5 }}
							>
								{theme === "dark" ? (
									<MdLightMode className="text-yellow-400" size={18} />
								) : (
									<MdDarkMode className="text-neutral-700" size={18} />
								)}
							</motion.button>

							{/* Menu Toggle Button */}
							<motion.button
								onClick={toggleMenu}
								className="p-2 rounded-lg bg-neutral-100/50 dark:bg-neutral-800/50 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200/70 dark:hover:bg-neutral-700/70 transition-colors duration-300 shadow-md backdrop-blur-sm"
								whileTap={{ scale: 0.9 }}
							>
								{menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
							</motion.button>
						</div>
					</div>
				</div>
			</div>

			{/* Mobile Menu */}
			<AnimatePresence>
				{menuOpen && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.3 }}
						className="md:hidden overflow-hidden bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl shadow-lg border-t border-neutral-200/50 dark:border-neutral-800/50"
					>
						<div className="container mx-auto px-4 py-4">
							{/* Mobile Menu Links */}
							<div className="px-4 py-6 space-y-6">
								{/* Mobile Search */}
								<form onSubmit={handleSearch} className="relative mb-6">
									<input
										type="text"
										placeholder="Search recipes..."
										className="w-full py-3 px-4 pr-10 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
									/>
									<button
										type="submit"
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
									>
										<FaSearch size={18} />
									</button>
								</form>

								{/* Navigation Links */}
								<nav className="flex flex-col space-y-1 mb-4">
								{navLinks.map((link) => (
									<NavLink
										key={link.to}
										to={link.to}
										onClick={() => setMenuOpen(false)}
										className={({ isActive, isPending }) =>
											`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
												isActive
													? "text-white bg-gradient-to-r from-primary to-secondary shadow-md"
													: isPending
													? "text-neutral-500 dark:text-neutral-400 bg-neutral-100/50 dark:bg-neutral-800/50"
													: "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-primary dark:hover:text-primary-light"
											}`
										}
									>
										{link.label}
									</NavLink>
								))}

								{/* Protected Links - Always visible but redirect to login if not authenticated */}
								{protectedLinks.map((link) => (
									<NavLink
										key={link.to}
										to={link.to}
										onClick={(e) => {
											setMenuOpen(false);
											handleProtectedLinkClick(e, link.to);
										}}
										className={({ isActive, isPending }) =>
											`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center ${
												isActive
													? "text-white bg-gradient-to-r from-primary to-secondary shadow-md"
													: isPending
													? "text-neutral-500 dark:text-neutral-400 bg-neutral-100/50 dark:bg-neutral-800/50"
													: "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-primary dark:hover:text-primary-light"
											}`
										}
									>
										{link.icon} {link.label}
									</NavLink>
								))}
							</nav>

							{/* User Info or Login/Register */}
							{user ? (
								<div className="border-t border-neutral-200/50 dark:border-neutral-800/50 pt-4">
									<div className="flex items-center gap-3 mb-4">
										<div className="w-12 h-12 rounded-full overflow-hidden border-2 border-neutral-200 dark:border-neutral-700 shadow-md">
											{user.photoURL ? (
												<img
													src={user.photoURL}
													alt={user.displayName || "User"}
													className="h-full w-full object-cover"
												/>
											) : (
												<FaUserCircle className="h-full w-full text-neutral-500 dark:text-neutral-400" />
											)}
										</div>
										<div>
											<p className="font-medium text-neutral-900 dark:text-neutral-100">
												{user.displayName || "User"}
											</p>
											<p className="text-sm text-neutral-500 dark:text-neutral-400 truncate max-w-[200px]">
												{user.email}
											</p>
										</div>
									</div>

									<div className="flex flex-col space-y-2">
										<Link
											to="/profile"
											onClick={() => setMenuOpen(false)}
											className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center hover:text-primary dark:hover:text-primary-light"
										>
											<FaUserCircle className="mr-2" /> Profile
										</Link>
										<Link
											to="/settings"
											onClick={() => setMenuOpen(false)}
											className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center hover:text-primary dark:hover:text-primary-light"
										>
											<svg
												className="w-4 h-4 mr-2"
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<circle cx="12" cy="12" r="3"></circle>
												<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
											</svg>{" "}
											Settings
										</Link>
										<button
											onClick={() => {
												handleLogOut();
												setMenuOpen(false);
											}}
											className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center"
										>
											<FaSignOutAlt className="mr-2" /> Logout
										</button>
									</div>
								</div>
							) : (
								<div className="border-t border-neutral-200/50 dark:border-neutral-800/50 pt-4 flex flex-col space-y-3">
									<Link
										to="/login"
										onClick={() => setMenuOpen(false)}
										className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors flex items-center justify-center border border-neutral-300/50 dark:border-neutral-700/50 hover:border-primary dark:hover:border-primary-light backdrop-blur-sm bg-white/30 dark:bg-neutral-800/30"
									>
										<FaSignInAlt className="mr-2" /> Login
									</Link>
									<Link
										to="/register"
										onClick={() => setMenuOpen(false)}
										className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-colors flex items-center justify-center shadow-md hover:shadow-primary/20"
									>
										<FaUserPlus className="mr-2" /> Register
									</Link>
								</div>
							)}
						</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Tooltip for user profile image */}
			<Tooltip id="user-tooltip" place="bottom" effect="solid" />
		</header>
	);
};

export default Navbar;
