interface SourceBadgeProps {
  source: 'Website' | 'Instagram' | 'Referral';
}

const sourceClasses: Record<SourceBadgeProps['source'], string> = {
  Website: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  Instagram: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
  Referral: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
};

const SourceBadge = ({ source }: SourceBadgeProps) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sourceClasses[source]}`}
    >
      {source}
    </span>
  );
};

export default SourceBadge;
