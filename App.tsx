import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useGameStore } from "./store/useGameStore";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import CollectionView from "./components/CollectionView";
import ExchangeView from "./components/ExchangeView";
import ProfileView from "./components/ProfileView";

const App: React.FC = () => {
	const { fetchUserData } = useGameStore();

	useEffect(() => {
		fetchUserData();
	}, [fetchUserData]);

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<LoginPage />} />

				<Route path="/" element={<MainLayout />}>
					<Route index element={<HomePage />} />
					<Route
						path="collection"
						element={
							<div className="p-4 md:p-8">
								<CollectionView />
							</div>
						}
					/>
					<Route path="games" element={<HomePage />} />
					<Route
						path="exchange"
						element={
							<div className="p-4 md:p-8">
								<ExchangeView />
							</div>
						}
					/>
					<Route
						path="profile"
						element={
							<div className="p-4 md:p-8">
								<ProfileView />
							</div>
						}
					/>
					<Route path="admin" element={<AdminPage />} />
				</Route>

				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	);
};

export default App;
