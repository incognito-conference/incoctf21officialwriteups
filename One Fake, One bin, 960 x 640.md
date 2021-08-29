# Incognito CTF

### 											Team : DEBUG          Write up



##### This is a problem created using steganography and networking.

#### 1 (Network)

1. First, Run WireShark to analyze the Pcap.

   If you look at the log, you can see that files are exchanged through Http format.

   ![1](https://user-images.githubusercontent.com/68684722/129661116-bca938f5-67fb-4ec4-82f2-8eb94602b064.png)

   

2. You can find IDA.zip synoToken among the cgi files. After extracting the file, if you make a zip extension, you can see the files inside
   ![2](https://user-images.githubusercontent.com/68684722/129662147-83c9d444-15d7-4df4-87bf-0e4ba41a40ba.png)

#### 2 (File)

1. If you open the Fake.jpg file with a hex editor, you can see the png file signature and data in the last chunk. You can find the first flag by copying the png signature and data, pasting it in a new hex editor, and saving it.

2. If you unzip the second compressed file, you can see the bin file. If you analyze it through the hex editor, you will see the bin file signature in front of the jpg file signature. If you delete the previous bin file signature and save it, you can find the second flag.
3. In the third file, 960 x 460, you can see that the width and height of the photo are different through the hex editor. as the file name is 960 460, edit it to the same length and width as the file name and save it to get the third flag.
