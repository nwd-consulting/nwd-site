/* Renders the team grid from data/team.json.
   Edit that one file to update this page — no code changes needed.
   Future: point DATA_URL at a Google Sheet published-to-web CSV and swap the parser. */
(function () {
  var DATA_URL = "data/team.json";
  var mount = document.getElementById("team-mount");
  if (!mount) return;

  function initials(name) {
    var clean = name.replace(/,.*$/, "").trim().split(/\s+/);
    var first = clean[0] ? clean[0][0] : "";
    var last = clean.length > 1 ? clean[clean.length - 1][0] : "";
    return (first + last).toUpperCase();
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  fetch(DATA_URL, { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      var people = data.people || [];
      var order = data.groupOrder || [];
      var groups = {};
      people.forEach(function (p) { (groups[p.group] = groups[p.group] || []).push(p); });
      // any group not listed in groupOrder gets appended at the end
      Object.keys(groups).forEach(function (g) { if (order.indexOf(g) === -1) order.push(g); });

      var html = "";
      order.forEach(function (g) {
        var members = groups[g];
        if (!members || !members.length) return;
        html += '<div class="team-group"><h2>' + esc(g) + "</h2><div class=\"people\">";
        members.forEach(function (p) {
          var hasBio = !!p.bio;
          var href = hasBio ? "people/" + encodeURIComponent(p.slug) + ".html" : null;
          var tag = hasBio ? "a" : "div";
          var attrs = hasBio ? ' href="' + href + '"' : "";
          html +=
            "<" + tag + ' class="person' + (hasBio ? " has-bio" : "") + '"' + attrs + ">" +
            '<div class="avatar" aria-hidden="true">' + esc(initials(p.name)) + "</div>" +
            "<h3>" + esc(p.name) + "</h3>" +
            '<p class="role">' + esc(p.title || "") + "</p>" +
            (hasBio ? '<span class="more">Read bio &rarr;</span>' : "") +
            "</" + tag + ">";
        });
        html += "</div></div>";
      });
      mount.innerHTML = html;
    })
    .catch(function (e) {
      mount.innerHTML =
        '<p class="loading">Team directory could not be loaded. ' +
        "If you are viewing this from a local file, serve it over HTTP " +
        "(e.g. <code>python3 -m http.server</code>). (" + esc(e.message) + ")</p>";
    });
})();
