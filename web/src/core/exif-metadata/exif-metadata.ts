import { Tags } from 'exifreader';

class ExifMetadata {
  public make: string | undefined;
  public model: string | undefined;
  public lensModel: string | undefined;
  public focalLength: string | undefined;
  public focalLengthIn35mm: string | undefined;
  public fNumber: string | undefined;
  public iso: string | undefined;
  public exposureTime: string | undefined;
  public thumbnail: string | undefined;
  public takenAt: string | undefined;

  constructor(metadata: Tags) {
    console.log('=== EXIF 메타데이터 전체 ===', metadata);
    this.make = metadata?.Make?.description;
    this.model = metadata?.Model?.description;
    
    // 렌즈 관련 태그들 디버깅
    console.log('=== 렌즈 관련 태그들 ===');
    console.log('LensModel:', metadata?.LensModel);
    console.log('LensSpec:', metadata?.LensSpec);
    console.log('Lens:', metadata?.Lens);
    console.log('LensInfo:', metadata?.LensInfo);
    
    // 모든 렌즈 관련 가능한 태그들 확인
    console.log('=== 모든 렌즈 관련 가능한 태그들 ===');
    const lensKeys = Object.keys(metadata).filter(key => 
      key.toLowerCase().includes('lens')
    );
    console.log('렌즈 관련 키들:', lensKeys);
    lensKeys.forEach(key => {
      console.log(`${key}:`, metadata[key]);
    });
    
    // 여러 렌즈 관련 태그를 확인 (LensModel, LensSpec, LensSpecification, Lens 순서로)
    let lensInfo = metadata?.LensModel?.description || 
                   metadata?.LensSpec?.description || 
                   metadata?.LensSpecification?.description ||
                   metadata?.Lens?.description ||
                   metadata?.LensInfo?.description;
    
    // Sony RX100M3의 경우 LensSpecification을 35mm 등가로 변환
    if (lensInfo === "8.8-25.7 mm f/2.8" || lensInfo === "8.8-25.7 mm f/1.8-2.8") {
      lensInfo = "24-70mm F1.8-2.8";
    }
    
    console.log('=== 렌즈 정보 처리 결과 ===');
    console.log('원본 lensInfo:', metadata?.LensSpecification?.description);
    console.log('변환된 lensInfo:', lensInfo);
    console.log('model:', this.model);
    
    this.lensModel = this.model ? lensInfo?.replace(this.model, '')?.trim() : lensInfo;
    
    console.log('최종 lensModel:', this.lensModel);
    this.focalLength = metadata?.FocalLength?.description?.replace(' mm', 'mm');
    this.focalLengthIn35mm = metadata?.FocalLengthIn35mmFilm?.value
      ? `${metadata?.FocalLengthIn35mmFilm?.value}mm`
      : metadata?.UprightFocalLength35mm?.value
      ? metadata.UprightFocalLength35mm.value.includes('.')
        ? `${metadata.UprightFocalLength35mm.value.split('.').shift()}mm`
        : `${metadata.UprightFocalLength35mm.value}mm`
      : undefined;
    this.fNumber = metadata?.FNumber?.description?.substring(0, 5)?.replace('f/', 'F');
    this.iso = metadata?.ISOSpeedRatings?.value ? 'ISO' + metadata?.ISOSpeedRatings?.value?.toString() : undefined;
    this.exposureTime = metadata?.ExposureTime?.description ? metadata?.ExposureTime?.description + 's' : undefined;
    this.thumbnail = metadata?.Thumbnail?.base64 ? 'data:image/jpg;base64,' + metadata?.Thumbnail?.base64 : undefined;

    if (metadata?.DateTimeOriginal?.description) {
      const yyyymmdd = metadata.DateTimeOriginal.description.split(' ')[0].split(':').join('-');
      const hhmmss = metadata.DateTimeOriginal.description.split(' ')[1];
      this.takenAt = `${yyyymmdd} ${hhmmss}`;
    }
  }
}

export default ExifMetadata;
