import { z } from "zod";
import { RetrieveBlobsWithPrefix } from "../../wailsjs/go/main/App";

const blobInfoSchema = z.object({
  Name: z.string(),
  AccessTier: z.string(),
  LastModified: z.string(),
  ContentMD5: z.string(),
});

const blobListSchema = z.array(blobInfoSchema);

// export asscoaited type
export type BlobInformation = z.infer<typeof blobInfoSchema>;

export async function getListBlobs(
  connectionString: string,
  containerName: string,
  prefix: string,
  nbMax: number
): Promise<BlobInformation[]> {
  try {
    const rawList = await await RetrieveBlobsWithPrefix(
      connectionString,
      containerName,
      prefix,
      nbMax
    );

    const listBlobs = blobListSchema.parse(rawList);
    return listBlobs;
  } catch (err) {
    console.log("# Error in getFilteredListDevices");
    console.log(err);
    return [];
  }
}
