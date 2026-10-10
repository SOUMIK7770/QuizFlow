# INT250 – Digital Forensics (Unit 2) — 30 MCQs
### Hard Disks & File Systems (CHFI-mapped)

### Q1. Which of the following storage devices uses spinning magnetic platters and a moving read/write head?

A) HDD (Hard Disk Drive)

B) RAM

C) CPU Cache

D) SSD (Solid State Drive)

**✅ Answer: A**

**Explanation:** An HDD stores data magnetically on rotating platters and uses a mechanical actuator arm with read/write heads, unlike SSDs which use flash memory with no moving parts.

---


### Q2. Why are SSDs forensically more challenging than HDDs when recovering deleted data?

A) SSDs cannot be imaged at all

B) SSDs do not support file systems

C) SSDs use the TRIM command and wear-leveling, which can permanently erase "deleted" data blocks in the background

D) SSDs always encrypt data automatically

**✅ Answer: C**

**Explanation:** TRIM tells the SSD controller to actively erase blocks marked as deleted (for performance), and wear-leveling constantly relocates data — both can destroy recoverable remnants before an investigator gets to image the drive.

---


### Q3. Which interface is commonly used by modern high-speed SSDs, connecting directly via PCIe lanes?

A) SCSI-1

B) NVMe

C) Floppy interface

D) IDE/PATA

**✅ Answer: B**

**Explanation:** NVMe (Non-Volatile Memory Express) is a protocol designed for PCIe-connected SSDs, offering much higher throughput and lower latency than older interfaces like SATA or IDE.

---


### Q4. What is the smallest unit of data that a file system allocates to store a file, typically consisting of one or more sectors?

A) Partition

B) Track

C) Platter

D) Cluster (allocation unit)

**✅ Answer: D**

**Explanation:** A cluster (or allocation unit) is the smallest storage unit a file system assigns to a file; even a 1-byte file consumes a full cluster, leaving "slack space" — a key forensic artifact.

---


### Q5. In a hard disk's physical geometry, what is a "sector"?

A) A type of file system

B) The entire physical disk enclosure

C) The smallest physically addressable unit on a disk, traditionally 512 bytes (or 4096 bytes on modern drives)

D) A logical drive letter assigned by the OS

**✅ Answer: C**

**Explanation:** A sector is the smallest physical storage unit on a disk; traditional sectors are 512 bytes, while modern "Advanced Format" drives use 4096-byte sectors.

---


### Q6. What is stored in the Master Boot Record (MBR) of a disk?

A) The entire operating system kernel

B) Only user files and documents

C) Boot loader code, a partition table (up to 4 primary partitions), and a boot signature (0x55AA)

D) The disk's warranty information

**✅ Answer: C**

**Explanation:** The MBR occupies the first 512-byte sector of the disk and contains bootstrap code, a partition table describing up to four primary partitions, and the 2-byte boot signature 0x55AA that marks it as valid.

---


### Q7. What is the maximum number of PRIMARY partitions supported by a traditional MBR partitioning scheme (without using an extended partition)?

A) 4

B) 8

C) 2

D) 128

**✅ Answer: A**

**Explanation:** MBR reserves space in its partition table for exactly 4 entries, allowing up to 4 primary partitions, or 3 primary partitions plus 1 extended partition (which can hold multiple logical drives).

---


### Q8. What is the primary limitation of MBR that led to the development of GPT?

A) MBR requires an internet connection to function

B) MBR cannot address disks larger than 2 TB and is limited to 4 primary partitions

C) MBR partitions cannot be named

D) MBR only works with Linux systems

**✅ Answer: B**

**Explanation:** MBR uses 32-bit sector addressing, which caps addressable disk size at 2 TB, and its partition table format hard-limits it to 4 primary partition entries — both resolved by GPT.

---


### Q9. Which partitioning scheme is required for booting via UEFI firmware and supports disks larger than 2 TB?

A) MBR

B) GPT (GUID Partition Table)

C) FAT16

D) exFAT

**✅ Answer: B**

**Explanation:** GPT is the modern partitioning standard paired with UEFI firmware; it uses 64-bit LBA addressing, supporting disks far larger than 2 TB and up to 128 partitions by default.

---


### Q10. From a forensic integrity standpoint, what key advantage does GPT have over MBR?

A) GPT does not require any partition table at all

B) GPT stores a backup/redundant partition table at the end of the disk and uses CRC32 checksums to detect corruption

C) GPT partitions cannot be encrypted

D) GPT is only used on removable USB drives

**✅ Answer: B**

**Explanation:** Unlike MBR (which has a single point of failure), GPT maintains a duplicate partition table at the end of the disk along with CRC32 checksums, making corruption or tampering easier to detect — valuable in forensic verification.

---


### Q11. Which file system is the default for modern Windows installations and supports features like journaling, file permissions (ACLs), and Alternate Data Streams (ADS)?

A) ext4

B) exFAT

C) NTFS

D) FAT32

**✅ Answer: C**

**Explanation:** NTFS (New Technology File System) is Windows' default file system, offering journaling for crash recovery, granular NTFS permissions, encryption (EFS), and Alternate Data Streams — the last of which is often abused to hide data.

---


### Q12. In NTFS, what is the "Master File Table (MFT)"?

A) The BIOS configuration file

B) A backup copy of the operating system

C) A database-like structure containing a record for every file and directory on the volume, including metadata and, for small files, the file content itself

D) A user-facing recycle bin

**✅ Answer: C**

**Explanation:** The MFT is central to NTFS — every file/folder has at least one MFT entry storing metadata (timestamps, permissions, pointers to data), and very small "resident" files can be stored entirely within their MFT entry.

---


### Q13. What is an "Alternate Data Stream (ADS)" in NTFS, and why is it forensically significant?

A) A backup of the file system journal

B) A network protocol for file sharing

C) A type of RAID configuration

D) A hidden secondary data stream attached to a file that is not visible in normal directory listings, sometimes used to conceal malicious data

**✅ Answer: D**

**Explanation:** NTFS allows a file to have multiple data streams; the primary stream is what's normally seen, but "alternate" streams (e.g., file.txt:hidden.exe) don't show in standard directory listings and are a known technique for hiding malware or data.

---


### Q14. Which file system was designed for maximum cross-platform compatibility (Windows, macOS, cameras, USB drives) but lacks journaling and has a 4 GB single-file size limit (in its original version)?

A) ext4

B) FAT32

C) NTFS

D) HFS+

**✅ Answer: B**

**Explanation:** FAT32 is widely compatible across operating systems and devices but has no journaling (making it more prone to corruption) and restricts individual file sizes to under 4 GB.

---


### Q15. Which file system is commonly used as the default on modern Linux distributions and uses journaling along with "inodes" to store file metadata?

A) ext4

B) ISO 9660

C) FAT16

D) NTFS

**✅ Answer: A**

**Explanation:** ext4 is a common default Linux file system; it uses journaling for reliability and inodes — data structures storing metadata (permissions, timestamps, pointers to data blocks) for each file, separate from the filename itself.

---


### Q16. In a Linux file system, what does an "inode" primarily store?

A) The actual file name only

B) A GUID for the entire disk

C) Metadata about a file (permissions, owner, timestamps, size, pointers to data blocks) — but NOT the file name itself

D) The BIOS boot sector

**✅ Answer: C**

**Explanation:** An inode holds a file's metadata and pointers to its data blocks; the actual filename is stored separately in the directory entry, which maps names to inode numbers — an important forensic distinction.

---


### Q17. What forensic artifact is created when a file is deleted but its clusters have not yet been overwritten by new data?

A) An automatic backup in System32

B) A corrupted MBR

C) A GPT checksum error

D) Recoverable "unallocated space" containing remnants of the deleted file's content

**✅ Answer: D**

**Explanation:** When a file is deleted, typically only its directory entry/MFT record is marked as free; the actual data remains in unallocated clusters until overwritten, making it recoverable via forensic tools like data carving.

---


### Q18. What is "file slack" in the context of disk forensics?

A) The empty space at the very end of the entire disk

B) The space reserved for the partition table

C) A folder used to store temporary internet files

D) The unused space between the end of a file's actual data and the end of the last cluster allocated to it, which may contain remnants of previously deleted data

**✅ Answer: D**

**Explanation:** Because clusters are fixed-size allocation units, a file rarely fills its last cluster completely; the leftover "slack" space can retain fragments of older, previously deleted data — a valuable forensic source.

---


### Q19. Which of the following BEST describes the relationship between "tracks," "sectors," and "cylinders" on a traditional HDD?

A) Tracks are concentric circles on a platter, divided into sectors; a cylinder is the set of aligned tracks across all platters at a given radius

B) Sectors are larger than tracks

C) They are unrelated units used only in networking

D) A cylinder is a single file stored on disk

**✅ Answer: A**

**Explanation:** A platter's surface is divided into concentric tracks, each split into sectors; a "cylinder" refers to the same track position across all platters/surfaces, addressed together by the drive's read/write heads (legacy CHS addressing).

---


### Q20. A forensic investigator finds a disk with a valid MBR boot signature but a corrupted partition table entry. What is the LIKELY forensic implication?

A) All data on the disk is instantly and permanently destroyed

B) The MBR signature becoming corrupted has no forensic significance

C) The OS may fail to recognize the partition, but the underlying data may still be recoverable via low-level sector analysis/partition table reconstruction

D) The disk is completely unreadable and must be discarded

**✅ Answer: C**

**Explanation:** A damaged partition table entry can make Windows/Linux fail to mount the partition normally, but since actual file data resides beyond the MBR, specialized tools can often reconstruct the partition table or carve data directly from raw sectors.

---


### Q21. Which of the following occurs FIRST in the Windows boot process, before any operating system code loads?

A) POST (Power-On Self-Test) performed by BIOS/UEFI firmware

B) Winlogon starts the user session

C) The Boot Configuration Data (BCD) is read

D) winload.exe loads the kernel

**✅ Answer: A**

**Explanation:** POST is the firmware-level hardware check (CPU, memory, peripherals) that runs immediately after power-on, before any boot loader or OS code is executed.

---


### Q22. In modern Windows systems (Vista and later), which component replaced the legacy boot.ini file to store boot configuration settings?

A) ntoskrnl.exe

B) The Windows Registry root key exclusively

C) autoexec.bat

D) BCD (Boot Configuration Data)

**✅ Answer: D**

**Explanation:** Since Windows Vista, the BCD store replaced boot.ini; it holds boot menu entries and configuration data read by the Windows Boot Manager (bootmgr) during startup.

---


### Q23. What is the role of "bootmgr" (Windows Boot Manager) in the Windows boot sequence?

A) It is a Linux-only bootloader component

B) It formats the hard disk during installation

C) It manages user passwords after login

D) It reads the BCD, presents any boot menu, and hands off control to winload.exe to begin loading the OS

**✅ Answer: D**

**Explanation:** After the firmware/MBR hands off control, bootmgr reads the BCD store, displays a boot menu if multiple OS options exist, and loads winload.exe to continue booting the selected Windows installation.

---


### Q24. Which file is responsible for loading the Windows kernel (ntoskrnl.exe) and essential boot drivers during startup?

A) winload.exe

B) systemd

C) init

D) GRUB

**✅ Answer: A**

**Explanation:** winload.exe is invoked by bootmgr and is responsible for loading the Windows kernel (ntoskrnl.exe), the HAL, and boot-start drivers before control passes to the kernel itself.

---


### Q25. What is the significance of "ntoskrnl.exe" in Windows forensics/architecture?

A) It only exists on Linux systems

B) It is the Windows NT kernel executable, responsible for core OS functions like process/memory management once loaded

C) It is a network configuration file

D) It is a user-installed antivirus program

**✅ Answer: B**

**Explanation:** ntoskrnl.exe is the core Windows NT kernel image; once loaded by winload.exe, it initializes the executive subsystems (process management, memory management, I/O) that form the running operating system.

---


### Q26. Which component is the FIRST to execute in a typical Linux boot sequence, immediately after firmware POST?

A) systemd/init

B) The Linux kernel

C) initramfs

D) The bootloader (commonly GRUB2)

**✅ Answer: D**

**Explanation:** After BIOS/UEFI POST completes and locates the boot device, control passes to the bootloader (typically GRUB2), which then loads the kernel and initramfs.

---


### Q27. What is the purpose of "initramfs" (initial RAM file system) in the Linux boot process?

A) It is the final, permanent root file system used throughout the OS session

B) It is a temporary root file system loaded into RAM that contains drivers/tools needed to mount the real root file system

C) It replaces GRUB entirely

D) It stores user documents and downloads

**✅ Answer: B**

**Explanation:** initramfs is a minimal, temporary file system loaded into memory by the bootloader, providing just enough drivers and utilities to locate and mount the actual root file system before control is handed to it.

---


### Q28. In most modern Linux distributions, which process is assigned PID 1 and is responsible for initializing user-space services after the kernel loads?

A) bootmgr

B) systemd (or legacy SysVinit)

C) NTFS.sys

D) winload.exe

**✅ Answer: B**

**Explanation:** systemd (replacing the older SysVinit in most modern distros) runs as PID 1 and manages the startup of system services, mount points, and targets (run levels) after the kernel has initialized hardware.

---


### Q29. A forensic investigator wants to determine whether a Linux system's boot process was tampered with (e.g., a malicious kernel module loaded at startup). Which area should they examine FIRST?

A) GRUB configuration files, initramfs contents, and systemd unit/service files for unauthorized modifications

B) The disk's optical drive firmware

C) The user's web browser history only

D) The printer spooler logs

**✅ Answer: A**

**Explanation:** Persistence mechanisms at boot are commonly planted via modified GRUB configs, tampered initramfs images, or malicious systemd unit files set to auto-start — making these the priority areas for boot-tampering analysis.

---


### Q30. Comparing Windows and Linux boot processes, which statement is MOST accurate?

A) Windows uses bootmgr/winload.exe to load ntoskrnl.exe, while Linux typically uses GRUB to load the kernel plus an initramfs — both ultimately hand off to an OS-specific initialization process (Winlogon vs. systemd/init)

B) Both use an identical bootloader and kernel format with no meaningful differences

C) Windows boots directly from GPT without any firmware involvement

D) Linux does not require a bootloader of any kind

**✅ Answer: A**

**Explanation:** While conceptually similar (firmware → bootloader → kernel → init), Windows and Linux use distinct components at each stage — Windows: bootmgr → winload.exe → ntoskrnl.exe → Winlogon; Linux: GRUB → kernel + initramfs → systemd/init.

---


## Answer Key Summary
| Q | Ans | Q | Ans | Q | Ans | Q | Ans | Q | Ans |
|---|---|---|---|---|---|---|---|---|---|
|1|A|2|C|3|B|4|D|5|C|
|6|C|7|A|8|B|9|B|10|B|
|11|C|12|C|13|D|14|B|15|A|
|16|C|17|D|18|D|19|A|20|C|
|21|A|22|D|23|D|24|A|25|B|
|26|D|27|B|28|B|29|A|30|A|

**Distribution check:** A=8, B=8, C=7, D=7
