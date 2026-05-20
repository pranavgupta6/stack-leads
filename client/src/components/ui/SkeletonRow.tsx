interface SkeletonRowProps {
  columns?: number;
}

const SkeletonRow = ({ columns = 6 }: SkeletonRowProps) => {
  return (
    <tr>
      {Array.from({ length: columns }, (_, index) => (
        <td key={index} className="px-4 py-3">
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </td>
      ))}
    </tr>
  );
};

export default SkeletonRow;
