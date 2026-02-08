import { Tooltip, Button } from '@strapi/design-system';

export function ToolbarButton({
  key,
  onClick,
  icon,
  active,
  disabled,
  tooltip,
  marginLeft,
  hidden,
}: {
  key: string;
  onClick: () => void;
  icon: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  tooltip: string;
  marginLeft?: number;
  hidden?: boolean;
}) {
  return (
    <Tooltip key={key} description={tooltip}>
      <Button
        onClick={onClick}
        variant="tertiary"
        size="S"
        paddingLeft={2}
        paddingRight={2}
        marginLeft={marginLeft ?? 1}
        disabled={disabled}
        style={{
          color: active ? 'black' : undefined,
          backgroundColor: active ? '#d9d8ff' : undefined,
          display: hidden ? 'none' : undefined,
        }}
      >
        {icon}
      </Button>
    </Tooltip>
  );
}
