package com.marklogic.hub.central.controllers.steps;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.central.AbstractMvcTest;
import com.marklogic.hub.central.controllers.FlowController;
import com.marklogic.hub.dataservices.StepService;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class FlowControllerTest extends AbstractMvcTest {

    private final static String PATH = "/api/flows";
    private int initialFlowCount;

    @Test
    void test() throws Exception {
        installReferenceModelProject();

        // Get the initial count of flows
        getJson(PATH).andExpect(status().isOk())
            .andDo(result -> {
                FlowController.FlowsWithStepDetails flows = parseFlowsWithStepDetails(result);
                initialFlowCount = flows.size();
            });

        // Create a flow
        final String flowName = "myTestFlow";
        FlowController.FlowInfo info = new FlowController.FlowInfo();
        info.name = flowName;
        info.description = "the description";
        postJson(PATH, info).andExpect(status().isCreated())
            .andDo(result -> {
                JsonNode response = parseJsonResponse(result);
                assertEquals(info.name, response.get("name").asText());
                assertEquals(info.description, response.get("description").asText());
            });

        // Get flows and verify
        getJson(PATH).andExpect(status().isOk())
            .andDo(result -> {
                FlowController.FlowsWithStepDetails flows = parseFlowsWithStepDetails(result);
                assertEquals(initialFlowCount + 1, flows.size());
                for (FlowController.FlowWithStepDetails flow : flows) {
                    if (info.name.equals(flow.name)) {
                        assertEquals(info.description, flow.description);
                        assertEquals(0, flow.steps.size());
                    }
                }
            });

        final String flowPath = PATH + "/" + flowName;

        // Update the flow
        info.description = "modified";
        putJson(flowPath, info).andExpect(status().isOk())
            .andDo(result -> {
                JsonNode response = parseJsonResponse(result);
                assertEquals(info.name, response.get("name").asText());
                assertEquals(info.description, response.get("description").asText());
            });

        // Create a mapping step to add to the flow
        final String stepDefinitionType = "mapping";
        MappingStepControllerTest.MappingStep mappingInfo = MappingStepControllerTest.newDefaultMappingStep("myMapper");
        StepService.on(getHubClient().getStagingClient()).saveStep(stepDefinitionType, objectMapper.valueToTree(mappingInfo));

        // Add the mapping step to the flow
        postJson(flowPath + "/steps", new FlowController.AddStepInfo(mappingInfo.name, stepDefinitionType))
            .andExpect(status().isOk());

        // Get the flows, verify the step is there
        getJson(PATH).andExpect(status().isOk())
            .andDo(result -> {
                FlowController.FlowsWithStepDetails flows = parseFlowsWithStepDetails(result);
                for (FlowController.FlowWithStepDetails flow : flows) {
                    if (info.name.equals(flow.name)) {
                        assertEquals(1, flow.steps.size());
                        assertEquals("1", flow.steps.get(0).stepNumber);
                        assertEquals(mappingInfo.name, flow.steps.get(0).stepName);
                        assertEquals(stepDefinitionType, flow.steps.get(0).stepDefinitionType);
                    }
                }
            });

        // Run the step
        postJson(flowPath + "/steps/1", "{}")
            .andExpect(status().isOk())
            .andDo(result -> {
                JsonNode response = parseJsonResponse(result);
                assertTrue(response.has("jobId"), "Running a step should result in a response with a jobId so that the " +
                    "client can then query for job status; response: " + response);
            });

        // Remove the step
        delete(flowPath + "/steps/1")
            .andExpect(status().isOk());

        // Verify the flow has no steps now
        getJson(PATH).andExpect(status().isOk())
            .andDo(result -> {
                FlowController.FlowsWithStepDetails flows = parseFlowsWithStepDetails(result);
                for (FlowController.FlowWithStepDetails flow : flows) {
                    if (info.name.equals(flow.name)) {
                        assertEquals(0, flow.steps.size(), "The step should have been removed");
                    }
                }
            });

        // Delete the flow
        delete(flowPath).andExpect(status().isOk());

        // Verify we're back to the initial count of flows
        getJson(PATH).andExpect(status().isOk())
            .andDo(result -> {
                FlowController.FlowsWithStepDetails flows = parseFlowsWithStepDetails(result);
                assertEquals(initialFlowCount, flows.size());
            });
    }

    @Test
    void permittedReadRunUser() throws Exception {
        installReferenceModelProject();

        loginAsTestUserWithRoles("hub-central-step-runner");

        // read flows
        getJson(PATH).andExpect(status().isOk());

        final String flowPath = PATH + "/ingestToFinal";
        // run ingestion step
        postJson(flowPath + "/steps/1", "{}")
                .andExpect(status().isOk());

        // run mapping step
        postJson(flowPath + "/steps/2", "{}")
                .andExpect(status().isOk());
    }

    @Test
    void forbiddenReadRunUser() throws Exception {
        installReferenceModelProject();

        loginAsTestUserWithRoles("hub-central-user");
        // read flows
        getJson(PATH).andExpect(status().isForbidden());

        final String flowPath = PATH + "/ingestToFinal";
        // run step
        postJson(flowPath + "/steps/1", "{}")
                .andExpect(status().isForbidden());

    }

    private FlowController.FlowsWithStepDetails parseFlowsWithStepDetails(MvcResult result) throws Exception {
        return objectMapper.readerFor(FlowController.FlowsWithStepDetails.class)
            .readValue(result.getResponse().getContentAsString());
    }
}