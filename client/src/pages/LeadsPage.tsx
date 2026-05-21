import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	getLeadsApi,
	createLeadApi,
	updateLeadApi,
	deleteLeadApi,
	exportLeadsApi,
} from '../api/leadsApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui';
import { Button, Modal, ConfirmDialog, Pagination } from '../components/ui';
import { LeadFilters as LeadFiltersComponent, LeadsTable, LeadForm } from '../components/leads';
import { Lead, LeadFilters, CreateLeadDto, PaginationMeta } from '../types';

const LeadsPage = () => {
	const [leads, setLeads] = useState<Lead[]>([]);
	const [pagination, setPagination] = useState<PaginationMeta | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isExporting, setIsExporting] = useState(false);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [editingLead, setEditingLead] = useState<Lead | null>(null);
	const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
	const [filters, setFilters] = useState<LeadFilters>({
		page: 1,
		status: '',
		source: '',
		search: '',
		sort: 'latest',
	});

	const { user } = useAuth();
	const { showToast } = useToast();
	const navigate = useNavigate();

	const fetchLeads = useCallback(async () => {
		setIsLoading(true);
		try {
			const response = await getLeadsApi(filters);
			setLeads(response.data);
			setPagination(response.pagination || null);
		} catch (error: unknown) {
			const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch leads';
			showToast(message, 'error');
		} finally {
			setIsLoading(false);
		}
	}, [filters, showToast]);

	useEffect(() => {
		fetchLeads();
	}, [fetchLeads]);

	const handleFiltersChange = (newFilters: Partial<LeadFilters>) => {
		setFilters((prev) => ({ ...prev, ...newFilters }));
	};

	const handleResetFilters = () => {
		setFilters({ page: 1, status: '', source: '', search: '', sort: 'latest' });
	};

	const handleCreateLead = async (data: CreateLeadDto) => {
		setIsSubmitting(true);
		try {
			await createLeadApi(data);
			showToast('Lead created successfully', 'success');
			setIsCreateModalOpen(false);
			if (filters.page === 1) {
				await fetchLeads();
			} else {
				setFilters((prev) => ({ ...prev, page: 1 }));
			}
		} catch (error: unknown) {
			const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create lead';
			showToast(message, 'error');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleUpdateLead = async (data: CreateLeadDto) => {
		if (!editingLead) return;
		setIsSubmitting(true);
		try {
			await updateLeadApi(editingLead._id, data);
			showToast('Lead updated successfully', 'success');
			setEditingLead(null);
			await fetchLeads();
		} catch (error: unknown) {
			const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update lead';
			showToast(message, 'error');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteLead = async () => {
		if (!deletingLead) return;
		setIsDeleting(true);
		try {
			await deleteLeadApi(deletingLead._id);
			showToast('Lead deleted successfully', 'success');
			setDeletingLead(null);
			if (leads.length === 1 && filters.page > 1) {
				setFilters((prev) => ({ ...prev, page: prev.page - 1 }));
			} else {
				await fetchLeads();
			}
		} catch (error: unknown) {
			const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete lead';
			showToast(message, 'error');
		} finally {
			setIsDeleting(false);
		}
	};

	const handleExport = async () => {
		setIsExporting(true);
		try {
			await exportLeadsApi({
				status: filters.status,
				source: filters.source,
				search: filters.search,
			});
			showToast('CSV exported successfully', 'success');
		} catch (error: unknown) {
			const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to export CSV';
			showToast(message, 'error');
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leads</h1>
					<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
						{pagination ? `${pagination.total} total leads` : 'Manage your leads'}
					</p>
				</div>

				<div className="flex items-center gap-3">
					{user?.role === 'admin' && (
						<Button
							variant="secondary"
							size="md"
							isLoading={isExporting}
							onClick={handleExport}
							leftIcon={
								<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
								</svg>
							}
						>
							Export CSV
						</Button>
					)}

					<Button
						variant="primary"
						size="md"
						onClick={() => setIsCreateModalOpen(true)}
						leftIcon={
							<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
							</svg>
						}
					>
						Add Lead
					</Button>
				</div>
			</div>

			<LeadFiltersComponent
				filters={filters}
				onFiltersChange={handleFiltersChange}
				onReset={handleResetFilters}
				isLoading={isLoading}
			/>

			<LeadsTable
				leads={leads}
				isLoading={isLoading}
				onEdit={(lead) => setEditingLead(lead)}
				onDelete={(lead) => setDeletingLead(lead)}
				onView={(id) => navigate(`/leads/${id}`)}
				onCreateFirst={() => setIsCreateModalOpen(true)}
			/>

			{pagination && pagination.totalPages > 1 && (
				<Pagination
					currentPage={pagination.page}
					totalPages={pagination.totalPages}
					onPageChange={(page) => handleFiltersChange({ page })}
					isLoading={isLoading}
				/>
			)}

			<Modal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				title="Add New Lead"
				size="md"
			>
				<LeadForm
					onSubmit={handleCreateLead}
					isSubmitting={isSubmitting}
					submitLabel="Create Lead"
				/>
			</Modal>

			<Modal
				isOpen={!!editingLead}
				onClose={() => setEditingLead(null)}
				title="Edit Lead"
				size="md"
			>
				{editingLead && (
					<LeadForm
						onSubmit={handleUpdateLead}
						defaultValues={editingLead}
						isSubmitting={isSubmitting}
						submitLabel="Save Changes"
					/>
				)}
			</Modal>

			<ConfirmDialog
				isOpen={!!deletingLead}
				onClose={() => setDeletingLead(null)}
				onConfirm={handleDeleteLead}
				title="Delete Lead"
				message={`Are you sure you want to delete "${deletingLead?.name || ''}"? This action cannot be undone.`}
				confirmLabel="Delete"
				isLoading={isDeleting}
			/>
		</div>
	);
};

export default LeadsPage;
