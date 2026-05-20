interface BadgeProps {
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost';
}

const statusClasses: Record<BadgeProps['status'], string> = {
  New: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  Contacted:
    'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  Qualified:
    'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  Lost: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const Badge = ({ status }: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses[status]}`}
    >
      {status}
    </span>
  );
};

export default Badge;
