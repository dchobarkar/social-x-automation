import Input from "@/components/form/Input";

export type SinceIdFieldProps = {
  value: string;
  onChange: (value: string) => void;
  name: string;
  label?: string;
  description?: string;
};

const SinceIdField = ({
  value,
  onChange,
  name,
  label = "Since ID",
  description = "Only fetch posts newer than this X post id.",
}: SinceIdFieldProps) => {
  return (
    <Input
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      name={name}
      inputMode="numeric"
      pattern="[0-9]*"
      placeholder="e.g. 1899234567890123456"
      description={description}
    />
  );
};

export default SinceIdField;
