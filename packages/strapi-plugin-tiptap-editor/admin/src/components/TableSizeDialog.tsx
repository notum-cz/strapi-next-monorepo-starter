import { Button, Dialog, Field, Flex, TextInput } from '@strapi/design-system';
import { ChangeEvent, FC, useEffect, useState } from 'react';

interface TableSizeDialogProps {
  open: boolean;
  defaultRows?: number;
  defaultCols?: number;
  onClose: () => void;
  onSave: (rows: number, cols: number) => void;
}

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

const parseNum = (value: string, fallback: number) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export const TableSizeDialog: FC<TableSizeDialogProps> = ({
  open,
  defaultRows = 3,
  defaultCols = 3,
  onClose,
  onSave,
}) => {
  const [rows, setRows] = useState<number>(defaultRows);
  const [cols, setCols] = useState<number>(defaultCols);

  useEffect(() => {
    if (open) {
      setRows(defaultRows);
      setCols(defaultCols);
    }
  }, [open, defaultRows, defaultCols]);

  const min = 1;
  const max = 10;

  const isValid = rows >= min && rows <= max && cols >= min && cols <= max;

  const handleSave = () => {
    if (!isValid) return;
    onSave(clamp(rows, min, max), clamp(cols, min, max));
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v: boolean) => {
        if (!v) onClose();
      }}
    >
      {open && (
        <Dialog.Content>
          <Dialog.Header>Insert table</Dialog.Header>
          <Dialog.Body>
            <Flex gap={4} alignItems="flex-end">
              <Field.Root width="100%">
                <Field.Label>Rows</Field.Label>
                <TextInput
                  name="table-rows"
                  type="number"
                  value={String(rows)}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setRows(clamp(parseNum(e.target.value, rows), min, max))
                  }
                  placeholder={String(defaultRows)}
                />
                <Field.Hint>
                  Min {min}, max {max}
                </Field.Hint>
              </Field.Root>
              <Field.Root width="100%">
                <Field.Label>Columns</Field.Label>
                <TextInput
                  name="table-cols"
                  type="number"
                  value={String(cols)}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setCols(clamp(parseNum(e.target.value, cols), min, max))
                  }
                  placeholder={String(defaultCols)}
                />
                <Field.Hint>
                  Min {min}, max {max}
                </Field.Hint>
              </Field.Root>
            </Flex>
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.Cancel>
              <Button variant="tertiary" fullWidth onClick={onClose}>
                Cancel
              </Button>
            </Dialog.Cancel>
            <Dialog.Action>
              <Button fullWidth variant="success-light" onClick={handleSave} disabled={!isValid}>
                Insert
              </Button>
            </Dialog.Action>
          </Dialog.Footer>
        </Dialog.Content>
      )}
    </Dialog.Root>
  );
};

export default TableSizeDialog;
