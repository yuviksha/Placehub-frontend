import { useCallback, useEffect, useMemo, useState } from "react";

import "./App.css";

const API = "http://localhost:8080/api";

const initialJobs = [

  {

    id: 1,

    title: "Java Developer Intern",

    company: "TechNova",

    location: "Hyderabad",

    type: "Internship",

    salary: "₹15,000/month",

  },

  {

    id: 2,

    title: "Frontend Developer",

    company: "PixelWorks",

    location: "Bengaluru",

    type: "Full-time",

    salary: "6 LPA",

  },

  {

    id: 3,

    title: "Python Developer Intern",

    company: "CodeSphere",

    location: "Remote",

    type: "Internship",

    salary: "₹12,000/month",

  },

  {

    id: 4,

    title: "Software Engineer",

    company: "InnovateTech",

    location: "Hyderabad",

    type: "Full-time",

    salary: "8 LPA",

  },

  {

    id: 5,

    title: "React Developer Intern",

    company: "WebCraft",

    location: "Remote",

    type: "Internship",

    salary: "₹10,000/month",

  },

];

function App() {

  const [page, setPage] = useState("home");

  const [jobs, setJobs] = useState([]);

  const [jobsLoading, setJobsLoading] = useState(true);

  const [backendError, setBackendError] = useState("");

  const [search, setSearch] = useState("");

  const [location, setLocation] = useState("All locations");

  const [selectedJob, setSelectedJob] = useState(null);

  const [applications, setApplications] = useState([]);

  const [applicationEmail, setApplicationEmail] = useState("");

  const [adminLoading, setAdminLoading] = useState(false);

  const [adminError, setAdminError] = useState("");

  const [updatingId, setUpdatingId] = useState(null);

  const [notice, setNotice] = useState("");

  const [authMode, setAuthMode] = useState("login");

  const [authName, setAuthName] = useState("");

  const [authEmail, setAuthEmail] = useState("");

  const [authPassword, setAuthPassword] = useState("");

  const [authBusy, setAuthBusy] = useState(false);

  const [authMessage, setAuthMessage] = useState("");

  const [loggedInStudent, setLoggedInStudent] = useState(null);

  const [showAddJobForm, setShowAddJobForm] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    location: "",
    type: "Internship",
    salary: "",
  });
  const [jobSubmitBusy, setJobSubmitBusy] = useState(false);
  const [jobSubmitMessage, setJobSubmitMessage] = useState("");
  const [jobSubmitError, setJobSubmitError] = useState("");

  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const [studentName, setStudentName] = useState("");

  const [studentEmail, setStudentEmail] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [formMessage, setFormMessage] = useState("");

  async function submitAuth(event) {

    event.preventDefault();

    setAuthMessage("");

    setAuthBusy(true);

    const endpoint = authMode === "register" ? "register" : "login";

    const payload = authMode === "register"

      ? { name: authName.trim(), email: authEmail.trim().toLowerCase(), password: authPassword }

      : { email: authEmail.trim().toLowerCase(), password: authPassword };

    try {

      const response = await fetch(`${API}/auth/${endpoint}`, {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(payload),

      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Authentication failed.");

      if (authMode === "register") {

        setAuthMessage("Account created successfully! You can now log in.");

        setAuthMode("login");

        setAuthPassword("");

      } else {

        setLoggedInStudent({ id: data.id, name: data.name, email: data.email });

        setStudentName(data.name || "");

        setStudentEmail(data.email || "");

        setApplicationEmail(data.email || "");

        setAuthMessage(`Welcome, ${data.name}! You are logged in.`);

      }

    } catch (error) {

      setAuthMessage(error.message || "Could not connect to the backend.");

    } finally {

      setAuthBusy(false);

    }

  }

  function logoutStudent() {

    setLoggedInStudent(null);

    setAuthName("");

    setAuthEmail("");

    setAuthPassword("");

    setAuthMessage("You have been logged out.");

    setPage("home");

  }

  async function submitNewJob(event) {
    event.preventDefault();
    setJobSubmitMessage("");
    setJobSubmitError("");
    setJobSubmitBusy(true);

    try {
      const response = await fetch(`${API}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newJob.title.trim(),
          company: newJob.company.trim(),
          location: newJob.location.trim(),
          type: newJob.type,
          salary: newJob.salary.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Could not add the job.");
      }

      setJobSubmitMessage("Job added successfully!");
      setNewJob({
        title: "",
        company: "",
        location: "",
        type: "Internship",
        salary: "",
      });
      await loadJobs();
    } catch (error) {
      setJobSubmitError(
        error.message || "Could not connect to the backend. Check Spring Boot."
      );
    } finally {
      setJobSubmitBusy(false);
    }
  }

  const loadJobs = useCallback(async () => {

    setJobsLoading(true);

    setBackendError("");

    try {

      const response = await fetch(`${API}/jobs`);

      if (!response.ok) {

        throw new Error("The backend could not load jobs.");

      }

      const data = await response.json();

      setJobs(Array.isArray(data) ? data : []);

    } catch {

      setJobs([]);

      setBackendError(

        "Could not connect to the backend. Make sure Spring Boot is running on port 8080."

      );

    } finally {

      setJobsLoading(false);

    }

  }, []);

  useEffect(() => {

    loadJobs();

  }, [loadJobs]);

  const filteredJobs = useMemo(() => {

    const term = search.trim().toLowerCase();

    return jobs.filter((job) => {

      const matchesSearch =

        !term ||

        [

          job.title,

          job.company,

          job.location,

          job.type,

          job.salary,

        ].some((value) =>

          String(value ?? "").toLowerCase().includes(term)

        );

      const matchesLocation =

        location === "All locations" ||

        String(job.location ?? "").toLowerCase() ===

          location.toLowerCase();

      return matchesSearch && matchesLocation;

    });

  }, [jobs, search, location]);

  function goTo(nextPage) {

    setPage(nextPage);

    setSelectedJob(null);

    setNotice("");

    setAdminError("");

    window.scrollTo({ top: 0, behavior: "smooth" });

  }

  async function openAdmin() {

    setPage("admin");

    setAdminLoading(true);

    setAdminError("");

    setNotice("");

    window.scrollTo({ top: 0, behavior: "smooth" });

    try {

      const response = await fetch(`${API}/applications/all`);

      if (!response.ok) {

        throw new Error("Could not load applications.");

      }

      const data = await response.json();

      setApplications(Array.isArray(data) ? data : []);

    } catch {

      setAdminError(

        "Could not load applications. Check that Spring Boot is running."

      );

    } finally {

      setAdminLoading(false);

    }

  }

  async function loadStudentApplications(email) {

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {

      setApplications([]);

      setAdminError("Enter an email address first.");

      return;

    }

    setApplicationEmail(cleanEmail);

    setAdminLoading(true);

    setAdminError("");

    setNotice("");

    try {

      const response = await fetch(

        `${API}/applications?email=${encodeURIComponent(cleanEmail)}`

      );

      if (!response.ok) {

        throw new Error("Could not load your applications.");

      }

      const data = await response.json();

      setApplications(Array.isArray(data) ? data : []);

    } catch {

      setAdminError("Could not load applications for that email.");

    } finally {

      setAdminLoading(false);

    }

  }

  async function submitApplication(event) {

    event.preventDefault();

    setFormMessage("");

    if (!selectedJob) return;

    if (!studentName.trim() || !studentEmail.trim()) {

      setFormMessage("Please enter your name and email.");

      return;

    }

    setSubmitting(true);

    try {

      const response = await fetch(`${API}/applications`, {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

          studentName: studentName.trim(),

          studentEmail: studentEmail.trim().toLowerCase(),

          jobId: selectedJob.id,

        }),

      });

      const data = await response.json();

      if (!response.ok) {

        throw new Error(data.message || "Application submission failed.");

      }

      setApplicationEmail(studentEmail.trim().toLowerCase());

      setNotice(data.message || "Application submitted successfully!");

      setShowApplicationForm(false);

      setSelectedJob(null);

      setFormMessage("");

      setPage("my-applications");

      await loadStudentApplications(studentEmail);

    } catch (error) {

      setFormMessage(error.message || "Something went wrong.");

    } finally {

      setSubmitting(false);

    }

  }

  async function updateStatus(applicationId, status) {

    setUpdatingId(applicationId);

    setAdminError("");

    setNotice("");

    try {

      const response = await fetch(

        `${API}/applications/${applicationId}/status`,

        {

          method: "PATCH",

          headers: { "Content-Type": "application/json" },

          body: JSON.stringify({ status }),

        }

      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(data.message || "Status update failed.");

      }

      setApplications((current) =>

        current.map((application) =>

          application.id === applicationId

            ? { ...application, status: data.status }

            : application

        )

      );

      setNotice(`Application #${applicationId} updated to ${status}.`);

    } catch (error) {

      setAdminError(error.message || "Could not update the status.");

    } finally {

      setUpdatingId(null);

    }

  }

  function statusClass(status) {

    return String(status || "Applied")

      .toLowerCase()

      .replace(/\s+/g, "-");

  }

  function renderJobCard(job) {

    return (

      <article className="job-card" key={job.id}>

        <div className="job-card-top">

          <span className="company-avatar">

            {String(job.company || "C").charAt(0).toUpperCase()}

          </span>

          <span className="job-type">{job.type || "Opportunity"}</span>

        </div>

        <h3>{job.title}</h3>

        <p className="company-name">{job.company}</p>

        <div className="job-meta">

          <span>⌖ {job.location}</span>

          <span>◷ {job.salary}</span>

        </div>

        <button

          className="details-button"

          onClick={() => {

            setSelectedJob(job);

            setShowApplicationForm(false);

            setFormMessage("");

          }}

        >

          View details <span>→</span>

        </button>

      </article>

    );

  }

  function renderApplications() {

    return (

      <section className="page-section">

        <div className="section-heading">

          <p className="eyebrow">YOUR CAREER JOURNEY</p>

          <h1>My applications</h1>

          <p>Check the latest status of your submitted applications.</p>

        </div>

        <form

          className="application-search"

          onSubmit={(event) => {

            event.preventDefault();

            loadStudentApplications(applicationEmail);

          }}

        >

          <input

            type="email"

            value={applicationEmail}

            onChange={(event) => setApplicationEmail(event.target.value)}

            placeholder="Enter your email address"

            required

          />

          <button className="primary-button" type="submit">

            Find applications

          </button>

        </form>

        {notice && <p className="success-message">{notice}</p>}

        {adminError && <p className="error-message">{adminError}</p>}

        {adminLoading ? (

          <p className="empty-state">Loading applications...</p>

        ) : applications.length === 0 ? (

          <div className="empty-state">

            <h3>No applications to display</h3>

            <p>Enter the email you used when applying for a job.</p>

          </div>

        ) : (

          <div className="application-grid">

            {applications.map((application) => (

              <article className="application-card" key={application.id}>

                <span

                  className={`status-badge ${statusClass(application.status)}`}

                >

                  {application.status}

                </span>

                <h3>{application.job?.title || "Job opportunity"}</h3>

                <p>{application.job?.company || "Company"}</p>

                <p className="application-location">

                  ⌖ {application.job?.location || "Location not available"}

                </p>

                <p className="application-status">

                  Application status: <strong>{application.status}</strong>

                </p>

              </article>

            ))}

          </div>

        )}

      </section>

    );

  }

  function renderAdmin() {

    const counts = {

      total: applications.length,

      applied: applications.filter((item) => item.status === "Applied").length,

      shortlisted: applications.filter(

        (item) => item.status === "Shortlisted"

      ).length,

      selected: applications.filter((item) => item.status === "Selected").length,

    };

    return (

      <section className="page-section admin-section">

        <div className="section-heading">

          <p className="eyebrow">PLACEMENTHUB MANAGEMENT</p>

          <h1>Admin dashboard</h1>

          <p>Review applications and update each applicant's status.</p>

        </div>

        <div className="admin-warning">

          Development mode: this dashboard is not protected by an admin login.

          Use it locally only.

        </div>

        <div className="admin-stats">

          <article className="stat-card">

            <span>Total applications</span>

            <strong>{counts.total}</strong>

          </article>

          <article className="stat-card">

            <span>Applied</span>

            <strong>{counts.applied}</strong>

          </article>

          <article className="stat-card">

            <span>Shortlisted</span>

            <strong>{counts.shortlisted}</strong>

          </article>

          <article className="stat-card">

            <span>Selected</span>

            <strong>{counts.selected}</strong>

          </article>

        </div>

        <div className="admin-toolbar">

          <div>

            <h2>Job management</h2>

            <p>Add job opportunities for students to view on the Find Jobs page.</p>

          </div>

          <button
            className="primary-button"
            type="button"
            onClick={() => {
              setShowAddJobForm((current) => !current);
              setJobSubmitMessage("");
              setJobSubmitError("");
            }}
          >
            {showAddJobForm ? "Cancel" : "+ Add Job"}
          </button>

        </div>

        {jobSubmitMessage && <p className="success-message">{jobSubmitMessage}</p>}
        {jobSubmitError && <p className="error-message">{jobSubmitError}</p>}

        {showAddJobForm && (
          <form className="application-form" onSubmit={submitNewJob}>
            <label>
              Job title
              <input
                value={newJob.title}
                onChange={(event) => setNewJob({ ...newJob, title: event.target.value })}
                placeholder="e.g. Java Developer Intern"
                required
              />
            </label>

            <label>
              Company
              <input
                value={newJob.company}
                onChange={(event) => setNewJob({ ...newJob, company: event.target.value })}
                placeholder="e.g. TechNova"
                required
              />
            </label>

            <label>
              Location
              <input
                value={newJob.location}
                onChange={(event) => setNewJob({ ...newJob, location: event.target.value })}
                placeholder="e.g. Hyderabad or Remote"
                required
              />
            </label>

            <label>
              Job type
              <select
                value={newJob.type}
                onChange={(event) => setNewJob({ ...newJob, type: event.target.value })}
                required
              >
                <option value="Internship">Internship</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
              </select>
            </label>

            <label>
              Salary / stipend
              <input
                value={newJob.salary}
                onChange={(event) => setNewJob({ ...newJob, salary: event.target.value })}
                placeholder="e.g. ₹15,000/month or 6 LPA"
                required
              />
            </label>

            <button className="primary-button modal-apply" type="submit" disabled={jobSubmitBusy}>
              {jobSubmitBusy ? "Saving job..." : "Save job"}
            </button>
          </form>
        )}

        <div className="admin-toolbar">
          <div>
            <h2>All applications</h2>
            <p>Updates are saved to the backend database.</p>
          </div>
          <button className="secondary-button" onClick={openAdmin}>
            ↻ Refresh
          </button>
        </div>

        {notice && <p className="success-message">{notice}</p>}

        {adminError && <p className="error-message">{adminError}</p>}

        {adminLoading ? (

          <div className="empty-state">Loading applications...</div>

        ) : applications.length === 0 ? (

          <div className="empty-state">

            <h3>No applications found</h3>

            <p>Submit an application from the Find Jobs page first.</p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table className="admin-table">

              <thead>

                <tr>

                  <th>ID</th>

                  <th>Student</th>

                  <th>Email</th>

                  <th>Job</th>

                  <th>Company</th>

                  <th>Current status</th>

                  <th>Update status</th>

                </tr>

              </thead>

              <tbody>

                {applications.map((application) => (

                  <tr key={application.id}>

                    <td>#{application.id}</td>

                    <td>{application.studentName}</td>

                    <td>{application.studentEmail}</td>

                    <td>{application.job?.title || "—"}</td>

                    <td>{application.job?.company || "—"}</td>

                    <td>

                      <span

                        className={`status-badge ${statusClass(application.status)}`}

                      >

                        {application.status}

                      </span>

                    </td>

                    <td>

                      <select

                        value={application.status || "Applied"}

                        disabled={updatingId === application.id}

                        onChange={(event) =>

                          updateStatus(application.id, event.target.value)

                        }

                        aria-label={`Update status for application ${application.id}`}

                      >

                        <option value="Applied">Applied</option>

                        <option value="Shortlisted">Shortlisted</option>

                        <option value="Rejected">Rejected</option>

                        <option value="Selected">Selected</option>

                      </select>

                      {updatingId === application.id && (

                        <small className="updating-text">Saving...</small>

                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

    );

  }

  return (

    <div className="app-shell">

      <header className="site-header">

        <div className="nav-inner">

          <button className="brand" onClick={() => goTo("home")}>

            <span className="brand-mark">P</span>

            <span>PlacementHub</span>

          </button>

          <nav className="main-nav">

            <button

              className={page === "home" ? "nav-active" : ""}

              onClick={() => goTo("home")}

            >

              Home

            </button>

            <button

              className={page === "jobs" ? "nav-active" : ""}

              onClick={() => goTo("jobs")}

            >

              Find Jobs

            </button>

            <button

              onClick={() => {

                setSearch("intern");

                goTo("jobs");

              }}

            >

              Internships

            </button>

            <button onClick={() => goTo("about")}>About</button>

          </nav>

          <div className="nav-actions">

            <button className="text-button" onClick={() => goTo("my-applications")}>My Applications</button>

            {loggedInStudent ? (

              <>

                <span className="text-button">Hi, {loggedInStudent.name}</span>

                <button className="text-button" onClick={logoutStudent}>Log out</button>

              </>

            ) : (

              <button className="text-button" onClick={() => {

                setAuthMode("login");

                setAuthMessage("");

                goTo("auth");

              }}>Sign in / Register</button>

            )}

            <button className="primary-button nav-cta" onClick={openAdmin}>Admin</button>

          </div>

        </div>

      </header>

      <main>

        {page === "home" && (

          <>

            <section className="hero-section">

              <div className="hero-inner">

                <div className="hero-copy">

                  <span className="hero-pill">✦ YOUR CAREER STARTS HERE</span>

                  <h1>

                    Find your next

                    <span> big opportunity.</span>

                  </h1>

                  <p>

                    Discover internships and jobs, connect with great

                    companies, and take the next step in your career.

                  </p>

                  <div className="hero-actions">

                    <button

                      className="primary-button hero-primary"

                      onClick={() => goTo("jobs")}

                    >

                      Explore opportunities <span>→</span>

                    </button>

                    <button

                      className="secondary-button"

                      onClick={() => goTo("about")}

                    >

                      Learn more

                    </button>

                  </div>

                  <div className="hero-stats">

                    <div>

                      <strong>500+</strong>

                      <span>Opportunities</span>

                    </div>

                    <div>

                      <strong>100+</strong>

                      <span>Companies</span>

                    </div>

                    <div>

                      <strong>1,000+</strong>

                      <span>Students</span>

                    </div>

                  </div>

                </div>

                <div className="hero-preview">

                  <div className="preview-top">

                    <span className="preview-star">✦</span>

                    <span className="open-pill">● Opportunities open</span>

                  </div>

                  <h2>Your future is waiting.</h2>

                  <p>One application could change everything.</p>

                  {jobs.slice(0, 2).map((job) => (

                    <button

                      className="preview-job"

                      key={job.id}

                      onClick={() => setSelectedJob(job)}

                    >

                      <span className="preview-letter">

                        {String(job.company || "J").charAt(0)}

                      </span>

                      <span>

                        <strong>{job.title}</strong>

                        <small>

                          {job.type} · {job.location}

                        </small>

                      </span>

                      <span className="preview-arrow">↗</span>

                    </button>

                  ))}

                  <div className="preview-footer">

                    ✦ Your journey begins today

                  </div>

                </div>

              </div>

            </section>

            <JobsSection

              jobs={jobs.slice(0, 3)}

              onViewAll={() => goTo("jobs")}

              onSelect={setSelectedJob}

            />

            <section className="cta-section">

              <div>

                <p className="eyebrow">YOUR NEXT CHAPTER</p>

                <h2>Ready to take the first step?</h2>

                <p>Create your profile and start discovering new opportunities.</p>

              </div>

              <button

                className="primary-button"

                onClick={() => goTo("jobs")}

              >

                Find your opportunity →

              </button>

            </section>

          </>

        )}

        {page === "jobs" && (

          <section className="page-section">

            <div className="section-heading">

              <p className="eyebrow">HANDPICKED FOR YOU</p>

              <h1>Explore opportunities</h1>

              <p>Find an opportunity that matches your skills.</p>

            </div>

            <div className="job-filters">

              <input

                type="search"

                value={search}

                onChange={(event) => setSearch(event.target.value)}

                placeholder="Search jobs, companies or skills..."

              />

              <select

                value={location}

                onChange={(event) => setLocation(event.target.value)}

              >

                <option>All locations</option>

                <option>Hyderabad</option>

                <option>Bengaluru</option>

                <option>Remote</option>

              </select>

            </div>

            <div className="results-row">

              <span>{filteredJobs.length} opportunities</span>

              <button className="text-button" onClick={loadJobs}>

                Refresh jobs

              </button>

            </div>

            {backendError && (

              <div className="error-panel">

                <p>{backendError}</p>

                <button className="secondary-button" onClick={loadJobs}>

                  Try again

                </button>

              </div>

            )}

            {jobsLoading ? (

              <div className="empty-state">Loading opportunities...</div>

            ) : filteredJobs.length ? (

              <div className="job-grid">

                {filteredJobs.map(renderJobCard)}

              </div>

            ) : (

              <div className="empty-state">

                <h3>No matching opportunities</h3>

                <p>Try another keyword or location.</p>

              </div>

            )}

          </section>

        )}

        {page === "my-applications" && renderApplications()}

        {page === "admin" && renderAdmin()}

        {page === "auth" && (

          <section className="page-section">

            <div className="section-heading">

              <p className="eyebrow">YOUR PLACEMENTHUB ACCOUNT</p>

              <h1>{authMode === "register" ? "Create your student account" : "Welcome back"}</h1>

              <p>Register or log in to your PlacementHub student account.</p>

            </div>

            <form className="application-form" onSubmit={submitAuth}>

              {authMode === "register" && (

                <label>

                  Full name

                  <input value={authName} onChange={(event) => setAuthName(event.target.value)} placeholder="Enter your full name" required />

                </label>

              )}

              <label>

                Email address

                <input type="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="Enter your email" required />

              </label>

              <label>

                Password

                <input type="password" value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} placeholder="At least 8 characters" minLength={authMode === "register" ? 8 : undefined} required />

              </label>

              {authMessage && <p className={loggedInStudent && authMode === "login" ? "success-message" : "error-message"}>{authMessage}</p>}

              <button className="primary-button modal-apply" type="submit" disabled={authBusy}>

                {authBusy ? "Please wait..." : authMode === "register" ? "Create account" : "Log in"}

              </button>

              <p>

                {authMode === "register" ? "Already have an account? " : "New to PlacementHub? "}

                <button className="text-button" type="button" onClick={() => {

                  setAuthMode(authMode === "register" ? "login" : "register");

                  setAuthMessage("");

                }}>

                  {authMode === "register" ? "Log in" : "Create an account"}

                </button>

              </p>

              {loggedInStudent && <p className="success-message">Logged in as {loggedInStudent.email}</p>}

            </form>

          </section>

        )}

        {page === "about" && (

          <section className="page-section about-section">

            <p className="eyebrow">ABOUT PLACEMENTHUB</p>

            <h1>A simpler path from classroom to career.</h1>

            <p>

              PlacementHub brings job listings and application tracking into

              one place. Students can explore opportunities and follow their

              applications, while administrators can review applications and

              update their status.

            </p>

            <button className="primary-button" onClick={() => goTo("jobs")}>

              Explore opportunities →

            </button>

          </section>

        )}

      </main>

      <footer className="site-footer">

        <button className="brand" onClick={() => goTo("home")}>

          <span className="brand-mark">P</span>

          <span>PlacementHub</span>

        </button>

        <p>Helping students move from classroom to career.</p>

        <span>© 2026 PlacementHub College Project</span>

      </footer>

      {selectedJob && (

        <div

          className="modal-backdrop"

          onClick={() => {

            setSelectedJob(null);

            setShowApplicationForm(false);

            setFormMessage("");

          }}

        >

          <section

            className="job-modal"

            onClick={(event) => event.stopPropagation()}

          >

            <button

              className="modal-close"

              onClick={() => {

                setSelectedJob(null);

                setShowApplicationForm(false);

                setFormMessage("");

              }}

              aria-label="Close dialog"

            >

              ×

            </button>

            <p className="eyebrow">OPPORTUNITY DETAILS</p>

            <h2>{selectedJob.title}</h2>

            <p className="company-name">{selectedJob.company}</p>

            <div className="job-detail-box">

              <p>📍 Location: {selectedJob.location}</p>

              <p>💰 Salary/Stipend: {selectedJob.salary}</p>

              <p>💼 Job type: {selectedJob.type}</p>

              <p>

                Explore the {selectedJob.title} opportunity at{" "}

                {selectedJob.company}.

              </p>

            </div>

            {!showApplicationForm ? (

              <button

                className="primary-button modal-apply"

                onClick={() => {

                  setShowApplicationForm(true);

                  setFormMessage("");

                }}

              >

                Apply Now →

              </button>

            ) : (

              <form className="application-form" onSubmit={submitApplication}>

                <label>

                  Full name

                  <input

                    value={studentName}

                    onChange={(event) => setStudentName(event.target.value)}

                    placeholder="Enter your full name"

                    required

                  />

                </label>

                <label>

                  Email address

                  <input

                    type="email"

                    value={studentEmail}

                    onChange={(event) => setStudentEmail(event.target.value)}

                    placeholder="Enter your email"

                    required

                  />

                </label>

                {formMessage && (

                  <p className="error-message">{formMessage}</p>

                )}

                <button

                  className="primary-button modal-apply"

                  type="submit"

                  disabled={submitting}

                >

                  {submitting ? "Submitting..." : "Submit application"}

                </button>

              </form>

            )}

          </section>

        </div>

      )}

    </div>

  );

}

function JobsSection({ jobs, onViewAll, onSelect }) {

  return (

    <section className="page-section featured-section">

      <div className="featured-heading">

        <div>

          <p className="eyebrow">HANDPICKED FOR YOU</p>

          <h2>Explore opportunities</h2>

          <p>Find an opportunity that matches your skills.</p>

        </div>

        <button className="secondary-button" onClick={onViewAll}>

          View all jobs →

        </button>

      </div>

      {jobs.length ? (

        <div className="job-grid">

          {jobs.map((job) => (

            <article className="job-card" key={job.id}>

              <div className="job-card-top">

                <span className="company-avatar">

                  {String(job.company || "C").charAt(0).toUpperCase()}

                </span>

                <span className="job-type">{job.type || "Opportunity"}</span>

              </div>

              <h3>{job.title}</h3>

              <p className="company-name">{job.company}</p>

              <div className="job-meta">

                <span>⌖ {job.location}</span>

                <span>◷ {job.salary}</span>

              </div>

              <button

                className="details-button"

                onClick={() => onSelect(job)}

              >

                View details <span>→</span>

              </button>

            </article>

          ))}

        </div>

      ) : (

        <div className="empty-state">

          <p>Jobs will appear here when the backend is connected.</p>

        </div>

      )}

    </section>

  );

}

export default App;
