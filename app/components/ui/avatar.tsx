interface AvatarProps {
  src: string;
  alt?: string;
  size?: number;
  className?: string;
}

export function Avatar({ src, alt = "User avatar", size = 32, className = "" }: AvatarProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
