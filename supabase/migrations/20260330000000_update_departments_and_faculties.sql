-- Drop existing constraints
ALTER TABLE profile_details DROP CONSTRAINT IF EXISTS check_department;
ALTER TABLE profile_details DROP CONSTRAINT IF EXISTS check_faculty;

ALTER TABLE contracts DROP CONSTRAINT IF EXISTS check_contract_department;
ALTER TABLE contracts DROP CONSTRAINT IF EXISTS check_contract_faculty;

-- Migrate existing data
UPDATE profile_details 
SET faculty = 'Facultad de ' || faculty 
WHERE faculty IN ('Tecnologia', 'Economia', 'Derecho');

UPDATE contracts 
SET faculty = 'Facultad de ' || faculty 
WHERE faculty IN ('Tecnologia', 'Economia', 'Derecho');

-- Add new constraints for profile_details
ALTER TABLE profile_details ADD CONSTRAINT check_department CHECK (
    department IS NULL OR department IN (
        'Santa Cruz', 'Cochabamba', 'La Paz', 'Chuquisaca', 'Tarija', 'Oruro', 'Potosi', 'Pando', 'Beni'
    )
);

ALTER TABLE profile_details ADD CONSTRAINT check_faculty CHECK (
    faculty IS NULL OR faculty IN (
        'Facultad de Tecnologia', 
        'Facultad de Economia', 
        'Facultad de Derecho',
        'Facultad de Ciencias Agrícolas y Agropecuarias',
        'Facultad de Ciencias Farmacéuticas y Bioquímicas',
        'Facultad de Desarrollo Rural y Territorial',
        'Facultad de Odontología',
        'Facultad de Medicina',
        'Facultad de Arquitectura',
        'Facultad de Humanidades',
        'Facultad de Ciencias Sociales',
        'Facultad de Ciencias Veterinarias'
    )
);

-- Add new constraints for contracts
ALTER TABLE contracts ADD CONSTRAINT check_contract_department CHECK (
    department IN (
        'Santa Cruz', 'Cochabamba', 'La Paz', 'Chuquisaca', 'Tarija', 'Oruro', 'Potosi', 'Pando', 'Beni'
    )
);

ALTER TABLE contracts ADD CONSTRAINT check_contract_faculty CHECK (
    faculty IN (
        'Facultad de Tecnologia', 
        'Facultad de Economia', 
        'Facultad de Derecho',
        'Facultad de Ciencias Agrícolas y Agropecuarias',
        'Facultad de Ciencias Farmacéuticas y Bioquímicas',
        'Facultad de Desarrollo Rural y Territorial',
        'Facultad de Odontología',
        'Facultad de Medicina',
        'Facultad de Arquitectura',
        'Facultad de Humanidades',
        'Facultad de Ciencias Sociales',
        'Facultad de Ciencias Veterinarias'
    )
);
