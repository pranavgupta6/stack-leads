import { Lead } from '../../types';
import { Badge, SourceBadge, Button } from '../ui';

interface LeadTableRowProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onView: (leadId: string) => void;
}

const LeadTableRow = ({ lead, onEdit, onDelete, onView }: LeadTableRowProps) => {
  return (
    <tr className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50">
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{lead.name}</p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{lead.email}</p>
        </div>
      </td>

      <td className="px-4 py-3">
        <Badge status={lead.status} />
      </td>

      <td className="px-4 py-3">
        <SourceBadge source={lead.source} />
      </td>

      <td className="px-4 py-3">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(lead.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onView(lead._id)}>
            View
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onEdit(lead)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDelete(lead)}>
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default LeadTableRow;