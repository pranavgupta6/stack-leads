import { Lead } from '../../types';
import { SkeletonRow, EmptyState } from '../ui';
import LeadTableRow from './LeadTableRow';

interface LeadsTableProps {
  leads: Lead[];
  isLoading: boolean;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onView: (leadId: string) => void;
  onCreateFirst?: () => void;
}

const LeadsTable = ({ leads, isLoading, onEdit, onDelete, onView, onCreateFirst }: LeadsTableProps) => {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Lead
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Source
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Created
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => <SkeletonRow key={index} columns={5} />)
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    title="No leads found"
                    description="Try adjusting your filters or create a new lead."
                    action={
                      onCreateFirst
                        ? {
                            label: 'Create your first lead',
                            onClick: onCreateFirst,
                          }
                        : undefined
                    }
                  />
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <LeadTableRow
                  key={lead._id}
                  lead={lead}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onView={onView}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadsTable;