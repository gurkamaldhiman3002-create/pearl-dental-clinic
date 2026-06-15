import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default async function AppleIcon() {
  const logoData = await readFile(
    join(process.cwd(), "public", "images", "logo.png"),
    "base64",
  );

  return new ImageResponse(
    (
      <div
        style={{
          borderRadius: 40,
          display: "flex",
          height: "100%",
          overflow: "hidden",
          width: "100%",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          src={`data:image/png;base64,${logoData}`}
          style={{
            height: "100%",
            objectFit: "cover",
            width: "100%",
          }}
        />
      </div>
    ),
    size,
  );
}
