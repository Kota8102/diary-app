import MakeBouquateImage from '@/assets/icons/make-bouquate.svg'

type BouquetButtonProps = {
  canCreateBouquet: boolean | undefined
  onCreateBouquet: () => void
  loading: boolean
}

export const BouquetButton = ({ canCreateBouquet, onCreateBouquet, loading }: BouquetButtonProps) => {
  if (!canCreateBouquet) return null

  return (
    <div className="relative">
      <div className="absolute right-0 top-[-40px]">
        <button
          type="button"
          className="flex items-center justify-center rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onCreateBouquet}
          onKeyUp={onCreateBouquet}
          aria-label="ブーケを作成する"
          disabled={loading}
        >
          <img src={MakeBouquateImage} alt="Make Bouquate" className="h-12" />
        </button>
      </div>
    </div>
  )
}
