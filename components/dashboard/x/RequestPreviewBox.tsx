import Card from "@/components/ui/Card";

export type RequestPreviewBoxProps = {
  title?: string;
  value: string;
  emptyText: string;
  className?: string;
};

const RequestPreviewBox = ({
  title = "Request preview",
  value,
  emptyText,
  className,
}: RequestPreviewBoxProps) => {
  return (
    <Card className={className}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/75">
        {title}
      </p>
      <p className="mt-2 wrap-break-word font-mono text-sm text-foreground">
        {value || emptyText}
      </p>
    </Card>
  );
};

export default RequestPreviewBox;
