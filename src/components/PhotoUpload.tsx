import { useRef } from 'react'
import { Camera, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface PhotoUploadProps {
  label: string
  photos: string[]
  onChange: (photos: string[]) => void
}

export default function PhotoUpload({ label, photos, onChange }: PhotoUploadProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = e => {
        const result = e.target?.result as string
        onChange([...photos, result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index))
  }

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {photos.map((src, i) => (
          <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
            <img src={src} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(i)}
              className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
            >
              <X size={10} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-brand hover:bg-orange-50 transition-colors text-gray-400 hover:text-brand"
        >
          <Camera size={20} />
          <span className="text-[10px] mt-1">{t('tasks.uploadPhoto')}</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  )
}
