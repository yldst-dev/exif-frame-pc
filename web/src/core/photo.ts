import { load } from 'exifreader';
import heic2any from 'heic2any';
import ExifMetadata from './exif-metadata/exif-metadata';
import thumbnail from './drawing/thumbnail';
import overrideExifMetadata from './exif-metadata/override-exif-metadata';
import { SafeStorage } from '../utils/safe-storage';

/**
 * Represents a photo.
 */
class Photo {
  private constructor() {}

  public file!: File;
  public metadata!: ExifMetadata;
  public image!: HTMLImageElement;
  public imageBase64!: string;
  public thumbnail!: string;

  /**
   * Creates a photo.
   * @param file - The file to create a photo from.
   * @returns The created photo.
   * @example
   * ```typescript
   * const photo = await Photo.create(file);
   * ```
   */
  public static async create(file: File): Promise<Photo> {
    const photo = new Photo();
    
    // Check if file is HEIC/HEIF and convert if necessary
    const isHeif = file.type === 'image/heic' || file.type === 'image/heif' || 
                   file.name.toLowerCase().endsWith('.heic') || 
                   file.name.toLowerCase().endsWith('.heif');
    
    let processedFile = file;
    
    if (isHeif) {
      try {
        // Convert HEIC/HEIF to JPEG for browser compatibility
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.95
        }) as Blob;
        
        // Create a new File object from the converted blob
        // Keep original filename but change extension to .jpg
        const originalName = file.name.replace(/\.(heic|heif)$/i, '');
        processedFile = new File([convertedBlob], `${originalName}.jpg`, {
          type: 'image/jpeg',
          lastModified: file.lastModified,
        });
      } catch (error) {
        console.error('Failed to convert HEIC/HEIF file:', error);
        throw new Error(`Failed to process HEIC/HEIF file: ${file.name}. ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    // Store both original and processed files
    photo.file = processedFile; // Use converted file for processing
    photo.metadata = new ExifMetadata(await load(file)); // Use original file for EXIF data
    photo.image = new Image();
    photo.image.src = URL.createObjectURL(processedFile);
    await new Promise((resolve, reject) => {
      photo.image.onload = resolve;
      photo.image.onerror = () => reject(new Error(`Failed to load image: ${processedFile.name}`));
    });

    photo.imageBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(processedFile);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error(`Failed to read file as data URL: ${processedFile.name}`));
    });

    photo.thumbnail = thumbnail(photo, 300, 250);
    return photo;
  }

  /**
   * Returns the make of the camera that took the photo.
   * @example 'SONY'
   */
  public get make(): string {
    if (!SafeStorage.getBooleanItem('showCameraMaker', true)) return '';
    return overrideExifMetadata()?.make || this.metadata.make || '';
  }

  /**
   * Returns the model of the camera that took the photo.
   * @example 'ILCE-7M3'
   */
  public get model(): string {
    if (!SafeStorage.getBooleanItem('showCameraModel', true)) return '';
    return overrideExifMetadata()?.model || this.metadata.model || '';
  }

  /**
   * Returns the lens model of the camera that took the photo.
   * @example 'FE 24-105mm F4 G OSS'
   */
  public get lensModel(): string {
    if (!SafeStorage.getBooleanItem('showLensModel', true)) {
      return '';
    }
    
    return overrideExifMetadata()?.lensModel || this.metadata.lensModel || '';
  }

  /**
   * Returns the focal length of the camera that took the photo.
   * @example '24mm'
   */
  public get focalLength(): string {
    if (SafeStorage.getBooleanItem('focalLengthRatioMode', false)) {
      const focalLength = parseFloat(overrideExifMetadata()?.focalLength?.replace(' mm', '') || this.metadata?.focalLength?.replace(' mm', '') || '0');
      return (focalLength * SafeStorage.getNumberItem('focalLengthRatio', 1)).toFixed(0) + 'mm';
    }
    return !SafeStorage.getBooleanItem('focalLength35mmMode', false)
      ? overrideExifMetadata()?.focalLength || this.metadata.focalLength || ''
      : overrideExifMetadata()?.focalLengthIn35mm || this.metadata.focalLengthIn35mm || '';
  }

  /**
   * Returns the F number of the camera that took the photo.
   * @example 'F4'
   */
  public get fNumber(): string {
    return overrideExifMetadata()?.fNumber || this.metadata.fNumber || '';
  }

  /**
   * Returns the ISO of the camera that took the photo.
   * @example 'ISO100'
   */
  public get iso(): string {
    return overrideExifMetadata()?.iso || this.metadata.iso || '';
  }

  /**
   * Returns the exposure time of the camera that took the photo.
   * @example '1/100s'
   */
  public get exposureTime(): string {
    return overrideExifMetadata()?.exposureTime || this.metadata.exposureTime || '';
  }

  /**
   * Returns the date the photo was taken.
   * @example '2021-01-01T00:00:00.000+09:00'
   */
  public get takenAt(): string {
    if (!overrideExifMetadata()?.takenAt && !this.metadata.takenAt) return '';

    const takenAt = new Date(overrideExifMetadata()?.takenAt || this.metadata.takenAt!);
    switch (SafeStorage.getItem('dateNotation', '2001/01/01 01:01:01') as string) {
      case '2001/01/01 01:01:01':
        return `${takenAt.getFullYear()}/${(takenAt.getMonth() + 1).toString().padStart(2, '0')}/${takenAt.getDate().toString().padStart(2, '0')} ${takenAt
          .getHours()
          .toString()
          .padStart(2, '0')}:${takenAt.getMinutes().toString().padStart(2, '0')}:${takenAt.getSeconds().toString().padStart(2, '0')}`;

      case '2001-01-01 01:01:01':
        return `${takenAt.getFullYear()}-${(takenAt.getMonth() + 1).toString().padStart(2, '0')}-${takenAt.getDate().toString().padStart(2, '0')} ${takenAt
          .getHours()
          .toString()
          .padStart(2, '0')}:${takenAt.getMinutes().toString().padStart(2, '0')}:${takenAt.getSeconds().toString().padStart(2, '0')}`;

      case '2001年01月01日 01時01分':
        return `${takenAt.getFullYear()}年${(takenAt.getMonth() + 1).toString().padStart(2, '0')}月${takenAt.getDate().toString().padStart(2, '0')}日 ${takenAt
          .getHours()
          .toString()
          .padStart(2, '0')}時${takenAt.getMinutes().toString().padStart(2, '0')}分`;

      case '2001년 01월 01일 01시 01분':
        return `${takenAt.getFullYear()}년 ${(takenAt.getMonth() + 1).toString().padStart(2, '0')}월 ${takenAt.getDate().toString().padStart(2, '0')}일 ${takenAt
          .getHours()
          .toString()
          .padStart(2, '0')}시 ${takenAt.getMinutes().toString().padStart(2, '0')}분`;

      case '2001/01/01':
        return `${takenAt.getFullYear()}/${(takenAt.getMonth() + 1).toString().padStart(2, '0')}/${takenAt.getDate().toString().padStart(2, '0')}`;

      case '2001-01-01':
        return `${takenAt.getFullYear()}-${(takenAt.getMonth() + 1).toString().padStart(2, '0')}-${takenAt.getDate().toString().padStart(2, '0')}`;

      case '2001年01月01日':
        return `${takenAt.getFullYear()}年${(takenAt.getMonth() + 1).toString().padStart(2, '0')}月${takenAt.getDate().toString().padStart(2, '0')}日`;

      case '2001년 01월 01일':
        return `${takenAt.getFullYear()}년 ${(takenAt.getMonth() + 1).toString().padStart(2, '0')}월 ${takenAt.getDate().toString().padStart(2, '0')}일`;

      case 'Jan 1, 2001':
        return `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][takenAt.getMonth()]} ${takenAt.getDate().toString().padStart(2, '0')}, ${takenAt.getFullYear()}`;

      default:
        return '';
    }
  }
}

export default Photo;
