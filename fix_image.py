import os

input_filename = "upload.jpg"
output_filename = "repaired_image.jpg"

# JPEG file format markers
SOI_MARKER = b'\xff\xd8'
EOI_MARKER = b'\xff\xd9'

try:
    print(f"Reading from {input_filename}...")
    with open(input_filename, 'rb') as f:
        data = f.read()

    # Find the start of the JPEG data
    start_index = data.find(SOI_MARKER)
    
    if start_index == -1:
        print("Error: Could not find JPEG start marker (FF D8). The file may not contain JPEG data.")
    else:
        print(f"Found JPEG start marker at position {start_index}.")
        
        # Find the end of the JPEG data, starting from where the image data begins
        end_index = data.find(EOI_MARKER, start_index)
        
        if end_index == -1:
            print("Warning: Could not find JPEG end marker (FF D9). The image may be truncated, but I will save what I found.")
            # Save everything from the start marker to the end of the file
            image_data = data[start_index:]
        else:
            print(f"Found JPEG end marker at position {end_index}.")
            # Extract the complete image data
            image_data = data[start_index : end_index + len(EOI_MARKER)]

        # Write the cleaned data to a new file
        with open(output_filename, 'wb') as f:
            f.write(image_data)
            
        print(f"Successfully repaired image and saved it to {output_filename}")
        print("Please try opening repaired_image.jpg.")

except FileNotFoundError:
    print(f"Error: The file {input_filename} was not found.")
except Exception as e:
    print(f"An error occurred: {e}")
