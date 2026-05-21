import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeadsApi } from '../api/leadsApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui';
import { Spinner, Button, Badge, SourceBadge } from '../components/ui';
import { Lead } from '../types';

const DashboardPage = () => {
	const { user } = useAuth();
	const { showToast } = useToast();
	const navigate = useNavigate();

	const [leads, setLeads] = useState<Lead[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [totalLeads, setTotalLeads] = useState(0);
	const [stats, setStats] = useState({
		total: 0,
		new: 0,
		qualified: 0,
		lost: 0,
		contacted: 0,
	});

	useEffect(() => {
		const fetchDashboardData = async () => {
			setIsLoading(true);
			try {
				const response = await getLeadsApi({ page: 1, sort: 'latest' });
				setLeads(response.data.slice(0, 5));
				setTotalLeads(response.pagination?.total || 0);
			} catch {
				showToast('Failed to load dashboard data', 'error');
			} finally {
				setIsLoading(false);
			}
		};
		fetchDashboardData();
	}, [showToast]);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const [all, newLeads, qualified, lost, contacted] = await Promise.all([
					getLeadsApi({ page: 1 }),
					getLeadsApi({ page: 1, status: 'New' }),
					getLeadsApi({ page: 1, status: 'Qualified' }),
					getLeadsApi({ page: 1, status: 'Lost' }),
					getLeadsApi({ page: 1, status: 'Contacted' }),
				]);
				setStats({
					total: all.pagination?.total || 0,
					new: newLeads.pagination?.total || 0,
					qualified: qualified.pagination?.total || 0,
					lost: lost.pagination?.total || 0,
					contacted: contacted.pagination?.total || 0,
				});
			} catch {
				// silently fail for stats
			}
		};
		fetchStats();
	}, []);

	const statCards = [
		{
			label: 'Total Leads',
			value: stats.total,
			color: 'bg-blue-500',
			lightBg: 'bg-blue-50 dark:bg-blue-900/20',
			textColor: 'text-blue-600 dark:text-blue-400',
			icon: (
				<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
						d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283
							 -.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283
							 .356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
				</svg>
			),
		},
		{
			label: 'New Leads',
			value: stats.new,
			color: 'bg-indigo-500',
			lightBg: 'bg-indigo-50 dark:bg-indigo-900/20',
			textColor: 'text-indigo-600 dark:text-indigo-400',
			icon: (
				<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
						d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0
							 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0
							 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976
							 -2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538
							 -1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57
							 -.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
				</svg>
			),
		},
		{
			label: 'Qualified',
			value: stats.qualified,
			color: 'bg-green-500',
			lightBg: 'bg-green-50 dark:bg-green-900/20',
			textColor: 'text-green-600 dark:text-green-400',
			icon: (
				<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
				</svg>
			),
		},
		{
			label: 'Lost',
			value: stats.lost,
			color: 'bg-red-500',
			lightBg: 'bg-red-50 dark:bg-red-900/20',
			textColor: 'text-red-600 dark:text-red-400',
			icon: (
				<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
						d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
				</svg>
			),
		},
	];

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					Dashboard
				</h1>
				<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
					Welcome back, {user?.name}. Here's what's happening.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{statCards.map((card) => (
					<div
						key={card.label}
						className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
					>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
									{card.label}
								</p>
								<p className={`mt-1 text-3xl font-bold ${card.textColor}`}>
									{card.value}
								</p>
							</div>
							<div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.lightBg} ${card.textColor}`}>
								{card.icon}
							</div>
						</div>
					</div>
				))}
			</div>

			<div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
				<div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
					<h2 className="text-base font-semibold text-gray-900 dark:text-white">
						Recent Leads
					</h2>
					<Button variant="ghost" size="sm" onClick={() => navigate('/leads')}>
						View all →
					</Button>
				</div>

				{isLoading ? (
					<div className="flex items-center justify-center py-12">
						<Spinner size="md" />
					</div>
				) : leads.length === 0 ? (
					<div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
						No leads yet.{' '}
						<button
							onClick={() => navigate('/leads')}
							className="text-blue-600 hover:underline dark:text-blue-400"
						>
							Create your first lead
						</button>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50">
									{['Lead', 'Status', 'Source', 'Created'].map((heading) => (
										<th
											key={heading}
											className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
										>
											{heading}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{leads.map((lead) => (
									<tr
										key={lead._id}
										onClick={() => navigate(`/leads/${lead._id}`)}
										className="cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
									>
										<td className="px-4 py-3">
											<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
												{lead.name}
											</p>
											<p className="text-xs text-gray-500 dark:text-gray-400">
												{lead.email}
											</p>
										</td>
										<td className="px-4 py-3">
											<Badge status={lead.status} />
										</td>
										<td className="px-4 py-3">
											<SourceBadge source={lead.source} />
										</td>
										<td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
											{new Date(lead.createdAt).toLocaleDateString('en-IN', {
												day: 'numeric', month: 'short', year: 'numeric',
											})}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
};

export default DashboardPage;
