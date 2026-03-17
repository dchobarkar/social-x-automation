import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

export type TweetDeleteModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const TweetDeleteModal = ({
  open,
  onClose,
  onConfirm,
}: TweetDeleteModalProps) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="centered"
      ariaLabel="Confirm delete tweet"
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-h3 font-semibold text-foreground">
            Delete tweet?
          </h3>

          <p className="mt-2 text-sm text-muted">
            This will remove the tweet from your saved JSON list. This action
            cannot be undone.
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TweetDeleteModal;
