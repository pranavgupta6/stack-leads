import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLeadByIdApi, updateLeadApi, deleteLeadApi } from '../api/leadsApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui';
import {
	Button, Badge, SourceBadge,
	Modal, ConfirmDialog, Spinner, EmptyState
} from '../components/ui';
import { LeadForm } from '../components/leads';
import { Lead, CreateLeadDto } from '../types';

const DetailField: React.FC<{
	label: string;
	value: React.ReactNode;
}> = ({ label, value }) => (
	<div>
		<p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
			{label}
		</p>
		<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
			{value}
		</div>
	</div>
);

const LeadDetailPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { user } = useAuth();
	const { showToast } = useToast();

	const [lead, setLead] = useState<Lead | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchLead = async () => {
			if (!id) return;
			setIsLoading(true);
			setError(null);
			try {
				const response = await getLeadByIdApi(id);
				setLead(response.data);
			} catch (err: unknown) {
				const message = (err as { response?: { data?: { message?: string } } })
					?.response?.data?.message || 'Failed to load lead';
				setError(message);
			} finally {
				setIsLoading(false);
			}
		};
		fetchLead();
	}, [id]);

	const handleUpdate = async (data: CreateLeadDto) => {
		if (!lead) return;
		setIsSubmitting(true);
		try {
			const response = await updateLeadApi(lead._id, data);
			setLead(response.data);
			setIsEditModalOpen(false);
			showToast('Lead updated successfully', 'success');
		} catch {
			showToast('Failed to update lead', 'error');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async () => {
		if (!lead) return;
		setIsDeleting(true);
		try {
			await deleteLeadApi(lead._id);
			showToast('Lead deleted successfully', 'success');
			navigate('/leads');
		} catch {
			showToast('Failed to delete lead', 'error');
			setIsDeleting(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<Spinner size="lg" />
			</div>
		);
	}

	if (error || !lead) {
		return (
			<EmptyState
				title="Lead not found"
				description={error || 'This lead does not exist or you do not have access.'}
				action={{ label: 'Back to Leads', onClick: () => navigate('/leads') }}
			/>
		);
	}

	return (
		<div className="mx-auto max-w-3xl space-y-6">
			<div className="flex items-center gap-4">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => navigate('/leads')}
					leftIcon={
						<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
					}
				>
					Back to Leads
				</Button>
			</div>

			<div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
				<div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5 dark:border-gray-700">
					<div>
						<h1 className="text-xl font-bold text-gray-900 dark:text-white">
							{lead.name}
						</h1>
						<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
							{lead.email}
						</p>
						<div className="mt-3 flex items-center gap-2">
							<Badge status={lead.status} />
							<SourceBadge source={lead.source} />
						</div>
						{user?.role ? (
							<p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
								Viewing as {user.role}
							</p>
						) : null}
					</div>
					<div className="flex shrink-0 items-center gap-2">
						<Button
							variant="secondary"
							size="sm"
							onClick={() => setIsEditModalOpen(true)}
						>
							Edit
						</Button>
						<Button
							variant="danger"
							size="sm"
							onClick={() => setIsDeleteDialogOpen(true)}
						>
							Delete
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-6 px-6 py-5 sm:grid-cols-2">
					<DetailField label="Full Name" value={lead.name} />
					<DetailField label="Email Address" value={lead.email} />
					<DetailField label="Status" value={<Badge status={lead.status} />} />
					<DetailField label="Source" value={<SourceBadge source={lead.source} />} />
					<DetailField
						label="Created At"
						value={new Date(lead.createdAt).toLocaleDateString('en-IN', {
							day: 'numeric', month: 'long', year: 'numeric',
							hour: '2-digit', minute: '2-digit',
						})}
					/>
					<DetailField
						label="Last Updated"
						value={new Date(lead.updatedAt).toLocaleDateString('en-IN', {
							day: 'numeric', month: 'long', year: 'numeric',
							hour: '2-digit', minute: '2-digit',
						})}
					/>
					{typeof lead.createdBy === 'object' && lead.createdBy && (
						<DetailField
							label="Created By"
							value={`${(lead.createdBy as { name: string }).name} (${(lead.createdBy as { role: string }).role})`}
						/>
					)}
				</div>
			</div>

			<Modal
				isOpen={isEditModalOpen}
				onClose={() => setIsEditModalOpen(false)}
				title="Edit Lead"
				size="md"
			>
				<LeadForm
					onSubmit={handleUpdate}
					defaultValues={lead}
					isSubmitting={isSubmitting}
					submitLabel="Save Changes"
				/>
			</Modal>

			<ConfirmDialog
				isOpen={isDeleteDialogOpen}
				onClose={() => setIsDeleteDialogOpen(false)}
				onConfirm={handleDelete}
				title="Delete Lead"
				message={`Are you sure you want to delete "${lead.name}"? This cannot be undone.`}
				confirmLabel="Delete"
				isLoading={isDeleting}
			/>
		</div>
	);
};

export default LeadDetailPage;
