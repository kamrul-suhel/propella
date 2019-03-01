<?php

namespace App\Http\Controllers;

use App\Competitor;
use App\Group;
use App\Organisation;
use App\People;
use App\Project;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ProjectController extends PropellaBaseController
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct(Request $request)
    {
        parent::__construct($request);
    }

    /**
     * @return mixed
     */
    public function create()
    {
        $this->validate($this->request, [
            'title'         => 'required|string|min:1',
            'description'   => 'required|string|min:1',
            'status'        => 'integer|between:1,3'
        ]);

        if(!$this->request->isPM){
            return response()->json("You are not a PM", 422);
        }

        // Create project.
        $project = new Project();
        $project->title         = $this->request->title;
        $project->description   = $this->request->description;
        $project->status        = $this->request->has('status') ? $this->request->status : 1;
        $project->created_by    = $this->request->authUserId;

        // Save project.
        $project->save();

        return response()->json($project);
    }

    /**
     * @param $id
     * @return mixed
     */
    public function update($id)
    {
        // Find project
        $project = Project::findOrFail($id);

        if(!in_array($project->created_by,[$this->request->authUserId, $this->request->projectManagerId])){
            return response()->json("You cannot update this project", 401);
        }

        $this->request->has('title') ? $project->title = $this->request->title : '';
        $this->request->has('description') ? $project->description = $this->request->description : '';
        $this->request->has('status') ? $project->status = $this->request->status : '';
        $project->save();

        return response()->json($project);
    }

    /**
     * @return mixed
     */
    public function list()
    {
        $projects = new Project();

        // filter by project status if status is passed
        $projects = $this->status != null ? $projects->where('status', $this->status) : $projects->whereIn('status', [0, 1]);
        $projects = $projects->where('archive', 0);
        // Anyone in the team can view/edit projects created by a project manager
        $projects = $projects->whereIn('created_by', [$this->request->authUserId, $this->request->projectManagerId]);
        $projects = $projects->paginate($this->perPage);

        // If has parameter archives then add last 5 archive.
        if ($this->request->has('archives') && $this->request->archives == 1) {
            foreach ($projects->items() as $project) {
                if(empty($project->parent_id)) {continue; }

                $ids = Project::getAllId($project->parent_id, $project->id);
                $archives = Project::select([
                    'id',
                    'updated_at'
                ])
                    ->whereIn('id', $ids)
                    ->orderBy('created_at', 'DESC')
                    ->limit(5)
                    ->get();

                $newArchives = [];
                $archives->map(function ($archive) use (&$newArchives) {
                    $newArchive['id'] = $archive->id;
                    $newArchive['updated_at'] = $archive->updated_at->format('l jS \of F, Y h:i:s A');
                    $newArchives[] = $newArchive;
                });

                $project->archives = $newArchives;
            }
        }
        return response()->json($projects);
    }

    /**
     * @param $id
     * @return mixed
     */
    public function single($id)
    {
        $project = Project::with(['groups.organisations.people'])
            ->whereIn('created_by', [$this->request->authUserId, $this->request->projectManagerId])
            ->findOrFail($id);

        $project->groups->map(function ($group) {
            $ids = Group::getAllId($group->parent_id);
            $groups = Group::select([
                'id',
                'positionX',
                'positionY',
                'icon_size',
                'icon_path'
            ])
                ->whereIn('id', $ids)
                ->get();
            $group->coordinates = $groups;
        });

        return response()->json($project);
    }

    /**
     * @param $id
     * @return mixed
     */
    public function activateProjectById($id)
    {
        $project = Project::findOrFail($id);
        $ids = Project::getAllId($project->parent_id, $project->id);

        // Find the activated project fist, then disable this project
        $disableProject = Project::with([
            'groups.organisations.people',
            'groups.competitors'
        ])
            ->whereIn('id', $ids)
            ->where('archive', 0)
            ->first();

        if (!$disableProject) {
            return response()->json('No activate project found');
        }

        $activateProject = Project::findOrFail($id);
        $activateProject->archive = 0;
        $activateProject->save();

        $activateGroups = Group::where('project_id', $activateProject->id)
            ->get();

        $activateGroups->map(function ($group) {
            $group->archive = 0;
            $group->save();

            // Enable competitor
            $competitors = Competitor::where('group_id', $group->id)->get();
            $competitors->map(function ($competitor) {
                $competitor->archive = 0;
                $competitor->save();
            });

            // Enable organisations
            $organisations = Organisation::where('group_id', $group->id)->get();
            $organisations->map(function ($organisation) {
                $organisation->archive = 0;
                $organisation->save();

                // Enable people
                $people = People::where('organisation_id', $organisation->id)->get();
                $people->map(function ($people) {
                    $people->archive = 0;
                    $people->save();
                });
            });
        });

        // Disable activated project
        $disableProject->archive = 1;
        $disableProject->save();

        $disableProject->groups->map(function ($group) {
            // Disable group
            $group->archive = 1;
            $group->save();

            // Disable competitor
            $group->competitors->map(function ($competitor) {
                $competitor->archive = 1;
                $competitor->save();
            });

            $group->organisations->map(function ($organisation) {
                // Disable organisation
                $organisation->archive = 1;
                $organisation->save();

                // Disable people
                $organisation->people->map(function ($people) {
                    $people->archive = 1;
                    $people->save();
                });
            });
        });
        return response()->json($activateProject);
    }


    /**
     * @param $id
     * @return mixed
     */
    public function delete($id)
    {
        $project = Project::findOrFail($id);
        $project->status = 2;
        $project->save();

        return response()->json($project);
    }

    /**
     * @param $id
     * @return mixed
     */
    public function archiveProject($id)
    {
        $project = Project::with([
            'groups.organisations.people',
            'groups.competitors'
        ])
            ->findOrFail($id);

        $project->archive = 1;
        $project->save();

        $newProject = $project->replicate();
        $newProject->parent_id = $project->id;
        $newProject->archive = 0;
        $newProject->save();

        // Loop groups coordinate, insert last record & update previous record status.
        $project->groups->map(function ($group) use ($newProject) {

            // Check if it has status 1
            $group->archive = 1;
            $group->save();

            // Duplicate record.
            $newGroup = $group->replicate();
            $newGroup->archive = 0;
            $newGroup->parent_id = $group->id;
            $newGroup->project_id = $newProject->id;
            $newGroup->save();

            // Disable competitor
            $group->competitors->map(function ($competitor) use ($newGroup) {
                $competitor->archive = 1;
                $competitor->save();

                // Duplicate competitor
                $newCompetitor = $competitor->replicate();
                $newCompetitor->archive = 0;
                $newCompetitor->group_id = $newGroup->id;
                $newCompetitor->parent_id = $competitor->id;
                $newCompetitor->save();
            });

            // Archive organisations
            $group->organisations->map(function ($organisation) use ($newGroup) {
                $organisation->archive = 1;
                $organisation->save();

                // Duplicate organisation
                $newOrganisation = $organisation->replicate();
                $newOrganisation->parent_id = $organisation->id;
                $newOrganisation->group_id = $newGroup->id;
                $newOrganisation->archive = 0;
                $newOrganisation->save();

                // Archive people
                $organisation->people->map(function ($people) use ($newOrganisation) {

                    $people->archive = 1;
                    $people->save();

                    $newPeople = $people->replicate();
                    $newPeople->parent_id = $people->id;
                    $newPeople->organisation_id = $newOrganisation->id;
                    $newPeople->archive = 0;
                    $newPeople->save();
                });
            });
        });

        return response()->json($project);
    }
}
