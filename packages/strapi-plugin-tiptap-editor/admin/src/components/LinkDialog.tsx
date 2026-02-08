import React from 'react';
import { Button, Dialog, Field, TextInput } from '@strapi/design-system';

export type LinkDialogPayload = { url: string };

interface LinkDialogProps {
  open: boolean;
  url: string | undefined;
  mode: 'add' | 'edit';
  onClose: () => void;
  onSave: (payload: LinkDialogPayload) => void;
  onRemove: () => void;
}

// Dialog for adding or editing/removing a link.
export const LinkDialog: React.FC<LinkDialogProps> = ({
  open,
  url,
  mode,
  onClose,
  onSave,
  onRemove,
}) => {
  const [value, setValue] = React.useState(url || '');

  React.useEffect(() => {
    if (open) {
      setValue(url || '');
    }
  }, [open, url, mode]);

  const handleSave = () => {
    onSave({ url: value.trim() });
  };

  const isSaveDisabled = mode === 'add' ? value.trim() === '' : false; // allow empty to remove when editing

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v: boolean) => {
        if (!v) onClose();
      }}
    >
      {open && (
        <Dialog.Content>
          <Dialog.Header>{mode === 'add' ? 'Add link' : 'Edit link'}</Dialog.Header>
          <Dialog.Body>
            <Field.Root width="100%">
              <Field.Label>URL</Field.Label>
              <TextInput
                name="link-url"
                placeholder="https://example.com"
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
              />
            </Field.Root>
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.Cancel>
              <Button variant="tertiary" fullWidth onClick={onClose}>
                Cancel
              </Button>
            </Dialog.Cancel>
            {mode === 'edit' && (
              <Button variant="danger-light" fullWidth onClick={onRemove}>
                Remove link
              </Button>
            )}
            <Dialog.Action>
              <Button
                fullWidth
                variant="success-light"
                onClick={handleSave}
                disabled={isSaveDisabled}
              >
                Save
              </Button>
            </Dialog.Action>
          </Dialog.Footer>
        </Dialog.Content>
      )}
    </Dialog.Root>
  );
};

export default LinkDialog;
