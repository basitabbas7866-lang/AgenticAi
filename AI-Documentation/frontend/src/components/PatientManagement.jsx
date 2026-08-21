import { getPatient, createPatient as registerPatient } from "../api";

function PatientManagement({
  patientId,
  setPatientId,
  patient,
  setPatient,
  showCreateForm,
  setShowCreateForm,
  newPatient,
  setNewPatient
}) {

  const searchPatient = async () => {
    try {
      const res = await getPatient(patientId);

      if (res.data.exists) {
        setPatient(res.data.patient);
      } else {
        alert("Patient Not Found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const createPatient = async () => {
    try {
      const res = await registerPatient(newPatient);

      setPatient({
        ...newPatient,
        patient_id: res.data.patient_id
      });

      alert(`Patient Created: ${res.data.patient_id}`);
      setShowCreateForm(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="patient-section">
        <h2>Patient Management</h2>
        <input
          placeholder="Patient ID"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
        />
        <button onClick={searchPatient}>
          Search Patient
        </button>
        <button onClick={() => setShowCreateForm(true)}>
          + New Patient
        </button>
      </div>

      {showCreateForm && (
        <div className="create-form">
          <input
            placeholder="Name"
            onChange={(e) =>
              setNewPatient({
                ...newPatient,
                name: e.target.value
              })
            }
          />
          <input
            placeholder="Age"
            onChange={(e) =>
              setNewPatient({
                ...newPatient,
                age: e.target.value
              })
            }
          />
          <input
            placeholder="Gender"
            onChange={(e) =>
              setNewPatient({
                ...newPatient,
                gender: e.target.value
              })
            }
          />
          <input
            placeholder="Phone"
            onChange={(e) =>
              setNewPatient({
                ...newPatient,
                phone: e.target.value
              })
            }
          />
          <button onClick={createPatient}>
            Create Patient
          </button>
        </div>
      )}

      {patient && (
        <div className="patient-card">
          <h3>Patient Profile</h3>
          <p>ID: {patient.patient_id}</p>
          <p>Name: {patient.name}</p>
          <p>Age: {patient.age}</p>
          <p>Gender: {patient.gender}</p>
          <p>Phone: {patient.phone}</p>
        </div>
      )}
    </>
  );
}

export default PatientManagement;
