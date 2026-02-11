import React, { useState } from "react";
import { Sparkles, Github, Loader2 } from "lucide-react";
import { LOGIN_REDIRECT_URL } from "../constants";
import { authClient } from "../lib/auth";

const LoginPage: React.FC = () => {
	const [isLoading, setIsLoading] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleSocialLogin = async (
		provider: "google" | "github" | "discord",
	) => {
		setIsLoading(provider);
		setError(null);
		try {
			await authClient.signIn.social({
				provider,
				callbackURL: LOGIN_REDIRECT_URL,
			});
		} catch (err: any) {
			setError(`Failed to login with ${provider}`);
			setIsLoading(null);
		}
	};

	return (
		<div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950">
			{/* Animated Background Elements */}
			<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse"></div>
			<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse delay-700"></div>

			<div className="z-10 w-full max-w-md px-6 animate-in fade-in zoom-in duration-500">
				<div className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[2.5rem] overflow-hidden">
					<div className="text-center pb-8 pt-12 px-6">
						<div className="mx-auto bg-gradient-to-tr from-indigo-500 to-purple-500 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-indigo-500/20 rotate-3 transition-transform hover:rotate-6">
							<Sparkles size={44} className="text-white fill-white/20" />
						</div>
						<h2 className="text-4xl font-black text-white tracking-tight mb-2">
							PillowWorld
						</h2>
						<p className="text-slate-400 font-medium px-4">
							Khám phá thế giới gối ôm huyền bí. Sưu tầm, trao đổi và chinh
							phục!
						</p>
					</div>

					<div className="px-10 pb-12 space-y-4">
						<button
							onClick={() => handleSocialLogin("google")}
							disabled={!!isLoading}
							className="w-full h-14 bg-white hover:bg-slate-100 text-slate-900 font-black rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 group disabled:opacity-50 disabled:active:scale-100"
						>
							{isLoading === "google" ? (
								<Loader2 className="animate-spin" size={20} />
							) : (
								<>
									<svg
										className="w-5 h-5 group-hover:scale-110 transition-transform"
										viewBox="0 0 48 48"
									>
										<path
											fill="#EA4335"
											d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
										/>
										<path
											fill="#4285F4"
											d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
										/>
										<path
											fill="#FBBC05"
											d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
										/>
										<path
											fill="#34A853"
											d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
										/>
									</svg>
									TIẾP TỤC VỚI GOOGLE
								</>
							)}
						</button>

						<div className="flex gap-4">
							<button
								onClick={() => handleSocialLogin("github")}
								disabled={!!isLoading}
								className="flex-1 h-14 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:active:scale-100"
							>
								{isLoading === "github" ? (
									<Loader2 className="animate-spin" size={20} />
								) : (
									<>
										<Github
											size={20}
											className="group-hover:rotate-12 transition-transform"
										/>
										GITHUB
									</>
								)}
							</button>
							<button
								onClick={() => handleSocialLogin("discord")}
								disabled={!!isLoading}
								className="flex-1 h-14 bg-[#5865F2] hover:bg-[#4752C4] text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:active:scale-100"
							>
								{isLoading === "discord" ? (
									<Loader2 className="animate-spin" size={20} />
								) : (
									<>
										<svg
											className="w-5 h-5 group-hover:-translate-y-1 transition-transform"
											fill="currentColor"
											viewBox="0 0 127.14 96.36"
										>
											<path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.06,72.06,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6.48,80.1a105.73,105.73,0,0,0,32.22,16.26,77.7,77.7,0,0,0,7.12-11.53,68.9,68.9,0,0,1-11.4-5.45c.95-.7,1.89-1.43,2.79-2.2a75.75,75.75,0,0,0,64.74,0c.9,1.17,1.84,1.89,2.79,2.2a68.49,68.49,0,0,1-11.4,5.44,77.76,77.76,0,0,0,7.12,11.53,105.41,105.41,0,0,0,32.27-16.26C129.6,50.12,125.7,26.27,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5.07-12.71,11.41-12.71,11.52,5.76,11.52,12.71S48.83,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5.07-12.71,11.44-12.71,11.52,5.76,11.52,12.71S84.79,65.69,84.69,65.69Z" />
										</svg>
										DISCORD
									</>
								)}
							</button>
						</div>

						{error && (
							<div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold p-4 rounded-xl text-center animate-shake">
								{error}
							</div>
						)}

						<p className="text-center text-[10px] text-slate-500 mt-8 leading-relaxed uppercase tracking-widest font-black">
							By signing in, you agree to our <br /> Terms & Privacy Policy
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
